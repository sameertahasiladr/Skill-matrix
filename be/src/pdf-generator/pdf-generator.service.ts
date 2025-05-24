import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillMatrix } from '../skills/entities/skillMatrix.entity';
import { Legend } from '../master/entities/legend.entity';
import { Tags } from '../skills/entities/tags.entity';
import { TagSkills } from '../skills/entities/tagskills.entity';
import { Response } from 'express';
import * as puppeteer from 'puppeteer';
import { mdToPdf } from 'md-to-pdf';

@Injectable()
export class PdfGeneratorService {
  constructor(
    @InjectRepository(SkillMatrix)
    private readonly skillsRepository: Repository<SkillMatrix>,
    @InjectRepository(Legend)
    private readonly legendRepository: Repository<Legend>,
    @InjectRepository(Tags)
    private readonly tagsRepository: Repository<Tags>,
    @InjectRepository(TagSkills)
    private readonly tagSkillsRepository: Repository<TagSkills>,
  ) {}

  async getFilteredData(role: string, designation: string, tags: string) {
    const formattedTags = tags.split(',').map((tag) => tag.trim());
    const isCommonIncluded = formattedTags.includes('common');
    const filteredTags = formattedTags.filter((tag) => tag !== 'common'); // remove 'common' from filtering

    let skillsWithTags: SkillMatrix[] = [];
    let commonSkills: SkillMatrix[] = [];

    // Fetch skills matching **all given tags (excluding common)**
    if (filteredTags.length > 0) {
      // build a query adn subquery
      skillsWithTags = await this.skillsRepository
        .createQueryBuilder('SkillMatrix')
        .leftJoinAndSelect('SkillMatrix.levels', 'levels')
        .leftJoinAndSelect('SkillMatrix.tagSkills', 'tagSkills')
        .leftJoinAndSelect('tagSkills.tags', 'tags')
        .leftJoinAndSelect('SkillMatrix.mainSkill', 'mainSkill')
        .leftJoinAndSelect('SkillMatrix.role', 'role')
        .leftJoinAndSelect('SkillMatrix.designation', 'designation')
        .where('role.title = :role', { role })
        .andWhere('designation.designation = :designation', { designation })
        .andWhere('tags.tags IN (:...filteredTags)', { filteredTags })
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select('subSkillMatrix.id')
            .from('SkillMatrix', 'subSkillMatrix')
            .leftJoin('subSkillMatrix.tagSkills', 'subTagSkills')
            .leftJoin('subTagSkills.tags', 'subTags')
            .where('subTags.tags IN (:...filteredTags)', { filteredTags })
            .groupBy('subSkillMatrix.id')
            .having('COUNT(DISTINCT subTags.id) = :tagCount', {
              tagCount: filteredTags.length,
            })
            .getQuery();

          return 'SkillMatrix.id IN ' + subQuery;
        })
        .orderBy('SkillMatrix.orderNo', 'ASC')
        .getMany();
    }

    // Fetch **Common Skills** filtered by designation and role
    if (isCommonIncluded) {
      // build a query adn subquery
      commonSkills = await this.skillsRepository
        .createQueryBuilder('SkillMatrix')
        .where((qb) => {
          const subQuery = qb
            .subQuery()
            .select('innerSkillMatrix.id')
            .from('SkillMatrix', 'innerSkillMatrix')
            .leftJoin('innerSkillMatrix.tagSkills', 'tagSkills')
            .leftJoin('tagSkills.tags', 'tags')
            .leftJoin('innerSkillMatrix.role', 'role')
            .leftJoin('innerSkillMatrix.designation', 'designation')
            .where('tags.tags = :commonTag', { commonTag: 'common' })
            .andWhere('designation.designation = :designation', { designation })
            .andWhere(
              `(role.title = :role OR (role.title = :developerRole AND :role IN (:...developerRoles)))`,
              {
                role,
                developerRole: 'Developer',
                developerRoles: ['Frontend', 'Backend'],
              },
            )
            .getQuery();

          return `SkillMatrix.id IN ${subQuery}`;
        })
        .orderBy(
          `CASE
              WHEN role.title = :role THEN 1
              WHEN role.title = 'Developer' THEN 2
              ELSE 3
          END`,
          'ASC',
        )
        .addOrderBy('SkillMatrix.orderNo', 'ASC')
        .leftJoinAndSelect('SkillMatrix.levels', 'levels')
        .leftJoinAndSelect('SkillMatrix.tagSkills', 'tagSkills')
        .leftJoinAndSelect('tagSkills.tags', 'tags')
        .leftJoinAndSelect('SkillMatrix.mainSkill', 'mainSkill')
        .leftJoinAndSelect('SkillMatrix.role', 'role')
        .leftJoinAndSelect('SkillMatrix.designation', 'designation')
        .getMany();

        const nonCommonTags = filteredTags.filter(tag => tag !== 'common');
  
        if (nonCommonTags.length > 0 && skillsWithTags.length === 0) {
          throw new NotFoundException(
            `No skills found for provided tags [${nonCommonTags.join(', ')}] with role ${role} & designation ${designation}`,
          );
        }

      // post process descriptions
      commonSkills.forEach((skill) => {
        if (skill.mainSkill?.mainSkill === 'Core') {
          skill.description = skill.description
            ?.replace(/\r\n|\n/g, '<br>') // replace line breaks with <br>
            ?.replace(/\*\s*\*\*/g, '**'); // remove extra * before **bold**
        }
      });
    }

    // **Group commonSkills by `mainSkill`**
    const groupedCommonSkills = commonSkills.reduce(
      (acc, skill) => {
        const mainSkillName = skill.mainSkill?.mainSkill || 'Unknown';
        if (!acc[mainSkillName]) {
          acc[mainSkillName] = [];
        }
        acc[mainSkillName].push(skill);
        return acc;
      },
      {} as Record<string, SkillMatrix[]>,
    );

    // **Fetch descriptions from the `legend` table**
    const designationId =
      skillsWithTags[0]?.designation?.id ||
      commonSkills[0]?.designation?.id ||
      null;
    const roleId =
      skillsWithTags[0]?.role?.id || commonSkills[0]?.role?.id || null;
    const mainSkillId =
      skillsWithTags[0]?.mainSkill?.id ||
      commonSkills[0]?.mainSkill?.id ||
      null;

    const generalDescriptionEntry = await this.legendRepository
      .createQueryBuilder('legend')
      .where('legend.designation.id = :designationId', { designationId })
      .andWhere('legend.role.id = :roleId', { roleId })
      .andWhere('legend.mainSkill IS NULL')
      .getOne();

    const mainSkillDescriptionEntry = await this.legendRepository
      .createQueryBuilder('legend')
      .where('legend.designation.id = :designationId', { designationId })
      .andWhere('legend.role.id = :roleId', { roleId })
      .andWhere('legend.mainSkill.id = :mainSkillId', { mainSkillId })
      .getOne();

    // Fetch descriptions for **common main skills** from legend
    const commonMainSkillIds = [
      ...new Set(commonSkills.map((s) => s.mainSkill?.id).filter(Boolean)),
    ];

    let groupedCommonSkillDescriptions = {};
    if (commonMainSkillIds.length > 0) {
      const legendDescriptions = await this.legendRepository
        .createQueryBuilder('legend')
        .leftJoinAndSelect('legend.mainSkill', 'mainSkill')
        .where('legend.designation.id = :designationId', { designationId })
        .andWhere('legend.role IS NULL')
        .andWhere('legend.mainSkill.id IN (:...mainSkillIds)', {
          mainSkillIds: commonMainSkillIds,
        })
        .getMany();

      // Group descriptions by `mainSkill`
      groupedCommonSkillDescriptions = legendDescriptions.reduce(
        (acc, legend) => {
          const mainSkillName = legend.mainSkill?.mainSkill || 'Unknown';
          if (!acc[mainSkillName]) {
            acc[mainSkillName] = [];
          }
          acc[mainSkillName].push(legend.description);
          return acc;
        },
        {} as Record<string, string[]>,
      );
    }
    // **Throw error if no skills found**
    if (!skillsWithTags.length && !commonSkills.length) {
      throw new NotFoundException(
        `No skills found for role: ${role}, designation: ${designation}, tags: ${tags}`,
      );
    }
    return {
      role,
      designation,
      tags: formattedTags,
      skills: skillsWithTags,
      groupedCommonSkills, // Common skills grouped by mainSkill
      generalDescription:
        generalDescriptionEntry?.description ||
        'No general description available.',
      mainSkillDescription:
        mainSkillDescriptionEntry?.description ||
        'No main skill description available.',
      commonSkillDescriptions: groupedCommonSkillDescriptions, // Grouped descriptions by mainSkill
    };
  }

  async loadMatrixWithVisibleSkills(role: string, designation: string, tags: string) {
    const filteredData = await this.getFilteredData(role, designation, tags);
    let {
      skills,
      groupedCommonSkills,
      generalDescription,
      mainSkillDescription,
      commonSkillDescriptions,
    } = filteredData;
  
    // Filter `isVisible` skills
    skills = skills.filter(skill => skill.isVisible);
  
    groupedCommonSkills = Object.fromEntries(
      Object.entries(groupedCommonSkills).map(([mainSkill, skills]) => [
        mainSkill,
        skills.filter(skill => skill.isVisible),
      ])
    );
  
    return {
      role,
      designation,
      tags,
      skills,
      groupedCommonSkills,
      generalDescription,
      mainSkillDescription,
      commonSkillDescriptions,
    };
  }
  

  async generatePdf(
    response: Response,
    role: string,
    designation: string,
    tags: string,
  ) {
    const filteredData = await this.getFilteredData(role, designation, tags);
    let {
      skills,
      groupedCommonSkills,
      generalDescription,
      mainSkillDescription,
      commonSkillDescriptions,
    } = filteredData;
    skills = skills.filter((skill) => skill.isVisible);
    groupedCommonSkills = Object.fromEntries(
      Object.entries(groupedCommonSkills).map(([key, skills]) => [
        key,
        skills.filter((skill) => skill.isVisible),
      ]),
    );

    const flattenedCommonSkills = Object.values(groupedCommonSkills).flat();

    // Generate Markdown with descriptions (only used in PDF)
    const markdownContent = this.generateMarkdown(
      skills,
      flattenedCommonSkills,
      generalDescription,
      mainSkillDescription,
      commonSkillDescriptions,
    );

    await this.generatePdfDocument(response, markdownContent);
  }

  private generateMarkdown(
    skills: SkillMatrix[],
    commonSkills: SkillMatrix[],
    generalDescription: string | undefined,
    mainSkillDescription: string | undefined,
    commonDescriptions: Record<string, string>,
  ): string {
    // Ensure `designation` and `role` are fetched from either `skills` or `commonSkills`
    const designation =
      skills[0]?.designation?.designation ||
      commonSkills[0]?.designation?.designation ||
      'N/A';
    const roleFromSkills = skills.find((skill) => skill.role?.title)?.role
      ?.title;
    const roleFromCommonSkills = commonSkills.find((skill) => skill.role?.title)
      ?.role?.title;

    // Now assign role safely
    const role = roleFromSkills || roleFromCommonSkills || 'N/A';

    let markdown = `# Skill Matrix: ${designation} - ${role}\n\n`;

    // Ensure `generalDescription` is assigned correctly even when `skills` is empty
    const finalGeneralDescription =
      generalDescription && generalDescription.trim() !== ''
        ? generalDescription
        : 'No general description available.';

    // General Overview should always be displayed
    markdown += `${finalGeneralDescription}\n\n`;

    // Main Skill Section (If Skills Exist)
    if (skills.length > 0) {
      markdown += `## Required Skills\n`;
      markdown += `- **Framework:**\n`;
      markdown += `  - ${skills[0]?.mainSkill?.mainSkill || 'N/A'}\n\n`;
    }

    // Extract unique common main skills
    const commonMainSkills = commonSkills
      .map((skill) => skill.mainSkill?.mainSkill)
      .filter((value, index, self) => value && self.indexOf(value) === index);

    // Ensure "Common" section always appears
    if (commonMainSkills.length > 0) {
      markdown += `- **Common:**\n`;
      commonMainSkills.forEach((ms) => {
        markdown += `  - ${ms}\n`;
      });
      markdown += `\n`;
    }

    // Main Skill Description (Only if `skills` exist)
    if (skills.length > 0) {
      markdown += `## ${skills[0]?.mainSkill?.mainSkill || 'N/A'}\n\n`;
      markdown += `**${mainSkillDescription || 'No description available.'}**\n\n`;

      // Table for Skills
      markdown += `| Skill | Description | Level | Responsibilities | Example |\n`;
      markdown += `|-------|------------|-------|------------------|---------|\n`;
      skills.forEach((skill) => {
        markdown += `| ${skill.skills || 'N/A'} | ${skill.description || 'N/A'} | ${skill.levels?.level || 'N/A'} | ${skill.responsibilities || 'N/A'} | ${skill.example || 'N/A'} |\n`;
      });
      markdown += `\n`;
    }

    // Ensure "Common Skills" Section Always Appears
    if (commonSkills.length > 0) {
      markdown += `## Common Skills\n\n`;

      // Group common skills by `mainSkill`
      const groupedCommonSkills: Record<string, SkillMatrix[]> = {};
      commonSkills.forEach((skill) => {
        const mainSkillName = skill.mainSkill?.mainSkill || 'General';
        if (!groupedCommonSkills[mainSkillName]) {
          groupedCommonSkills[mainSkillName] = [];
        }
        groupedCommonSkills[mainSkillName].push(skill);
      });

      // Iterate over grouped skills and create tables
      for (const [mainSkillName, skillList] of Object.entries(
        groupedCommonSkills,
      )) {
        markdown += `### ${mainSkillName}\n\n`;
        markdown += `**${commonDescriptions[mainSkillName] || 'No description available.'}**\n\n`;

        // Table for Common Skills
        markdown += `| Skill | Description | Level | Responsibilities | Example |\n`;
        markdown += `|-------|------------|-------|------------------|---------|\n`;
        skillList.forEach((skill) => {
          markdown += `| ${skill.skills || 'N/A'} | ${skill.description || 'N/A'} | ${skill.levels?.level || 'N/A'} | ${skill.responsibilities || 'N/A'} | ${skill.example || 'N/A'} |\n`;
        });
        markdown += `\n`;
      }
    }

    return markdown;
  }

  private async generatePdfDocument(
    response: Response,
    markdownContent: string,
  ) {
    try {
      const htmlWithStyles = await mdToPdf(
        { content: markdownContent },
        { as_html: true },
      ).then((res) => res.content);

      const levelsTable = `
        <h2 class="appendix-title">Appendix</h2>
        <ul>
          <li><strong>Levels:</strong></li>
        </ul>
        <table class="levels-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Understanding</td>
              <td>Know what it is and have a basic idea of how it works.</td>
            </tr>
            <tr>
              <td>Basic</td>
              <td>Perform simple tasks and understand the fundamental concepts.</td>
            </tr>
            <tr>
              <td>Intermediate</td>
              <td>Handle more complex tasks and have a good grasp of the subject.</td>
            </tr>
            <tr>
              <td>Advanced</td>
              <td>Manage advanced tasks and solve problems independently.</td>
            </tr>
            <tr>
              <td>Proficient</td>
              <td>Very skilled and can handle almost any task related to this skill.</td>
            </tr>
            <tr>
              <td>Expert</td>
              <td>Deep knowledge and can teach or lead others in this area.</td>
            </tr>
          </tbody>
        </table>
      `;

      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.setContent(`
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; font-size: 28px; color: #333; }
            h2 { font-size: 20px; font-weight: bold; color: #444; }
           
            /* General Table Styling for Required & Common Skills */
            table:not(.levels-table) {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              table-layout: auto;
            }
            table:not(.levels-table) thead th {
              background-color: #cce5ff;
              color: #000;
              padding: 12px;
              text-align: left;
              font-size: 14px;
              font-weight: bold;
              border: 1px solid #b3d7ff;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            table:not(.levels-table) tbody td {
              border: 1px solid #ddd;
              padding: 10px;
              font-size: 12px;
              background-color: #fff;
              white-space: pre-wrap;
              word-wrap: break-word;
              overflow-wrap: break-word;
              vertical-align: top;
              page-break-inside: avoid;
            }
            table:not(.levels-table) tr {
             break-inside: avoid;
             page-break-inside: avoid;
            }
 
            /* Bullet Points for Lists in Required & Common Skills */
            ul {
              list-style-type: disc !important;
              padding-left: 20px;
            }
            ul li {
             font-weight: bold;
             margin-top: 5px;
            }
            ul li ul {
            margin-left: 20px;
            }
            ul li ul li {
            font-weight: normal;
              list-style-type: disc !important;
            }
 
            /* Appendix Title */
            .appendix-title {
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
 
            /* Bullet before 'Levels' */
            ul { margin-left: 20px; padding-left: 20px; }
            ul li { font-size: 16px; font-weight: bold; }
 
            /* Levels Table - Custom Styling */
            .levels-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .levels-table th,
            .levels-table td {
              border: 1px solid #ddd; /* Light gray border */
              padding: 10px;
              text-align: left;
            }
            .levels-table thead {
              background-color: #f5f5f5; /* Slightly darker header */
              font-weight: bold;
            }
            .levels-table tbody tr:nth-child(even) {
              background-color: #f9f9f9; /* Alternating row color */
            }
          </style>
        </head>
        <body>
          ${htmlWithStyles}  <!-- Inject Markdown-converted HTML -->
          ${levelsTable}  <!-- Inject Levels Table Separately -->
        </body>
        </html>
      `);

      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();

      response.setHeader('Content-Type', 'application/pdf');
      response.setHeader(
        'Content-Disposition',
        'attachment; filename=Skill-Matrix.pdf',
      );
      response.end(pdf);
    } catch (error) {
      console.error('Error generating PDF:', error);
      response.status(500).send('Failed to generate PDF');
    }
  }
}
