import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExcelService } from '../excel/excel.service';
import { MainSkill } from '../master/entities/mainskill.entity';
import { Role } from '../master/entities/role.entity';
import { SkillMatrix } from '../skills/entities/skillMatrix.entity';
import { Legend } from '../master/entities/legend.entity';

@Injectable()
export class RoadmapsService {
  constructor(
    @InjectRepository(SkillMatrix)
    private readonly skillMatrixRepository: Repository<SkillMatrix>,
    @InjectRepository(MainSkill)
    private readonly mainSkillRepository: Repository<MainSkill>,
    @Inject() private readonly excelService: ExcelService,
  ) {}

  async createRoadmap(role: string, skillTags: string) {
    console.log('in roadmap service~~~');

    const formattedTags = skillTags.split(',').map((tag) => tag.trim());
    const isCommonIncluded = formattedTags.includes('common');
    const filteredTags = formattedTags.filter((tag) => tag !== 'common'); // remove 'common' from filtering

    let skillsWithTags: SkillMatrix[] = [];
    let commonSkills: SkillMatrix[] = [];

    // Fetch skills matching **all given tags (excluding common)**
    if (filteredTags.length > 0) {
      // build a query adn subquery
      skillsWithTags = await this.skillMatrixRepository
        .createQueryBuilder('SkillMatrix')
        .select(['SkillMatrix.skills', 'MIN(SkillMatrix.orderNo) AS orderNo'])
        .leftJoin('SkillMatrix.tagSkills', 'tagSkills')
        .leftJoin('tagSkills.tags', 'tags')
        .leftJoin('SkillMatrix.mainSkill', 'mainSkill')
        .leftJoin('SkillMatrix.role', 'role')
        .where('role.title = :role', { role })
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
        .groupBy('SkillMatrix.skills')
        .orderBy('orderNo', 'ASC')
        .getRawMany();
    }

    // Fetch **Common Skills** filtered by designation and role
    if (isCommonIncluded) {
      // build a query adn subquery
      commonSkills = await this.skillMatrixRepository
        .createQueryBuilder('SkillMatrix')
        .where((qb) => {
          const subQuery = qb
            .subQuery()
            .select('innerSkillMatrix.id')
            .from('SkillMatrix', 'innerSkillMatrix')
            .leftJoin('innerSkillMatrix.tagSkills', 'tagSkills')
            .leftJoin('tagSkills.tags', 'tags')
            .leftJoin('innerSkillMatrix.role', 'role')
            .where('tags.tags = :commonTag', { commonTag: 'common' })
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
        .leftJoin('SkillMatrix.tagSkills', 'tagSkills')
        .leftJoin('tagSkills.tags', 'tags')
        .leftJoinAndSelect('SkillMatrix.mainSkill', 'mainSkill')
        .leftJoin('SkillMatrix.role', 'role')
        .getMany();

      const nonCommonTags = filteredTags.filter((tag) => tag !== 'common');

      if (nonCommonTags.length > 0 && skillsWithTags.length === 0) {
        throw new NotFoundException(
          `No skills found for provided tags [${nonCommonTags.join(', ')}] with role ${role}`,
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

    // **Throw error if no skills found**
    if (!skillsWithTags.length && !commonSkills.length) {
      throw new NotFoundException(
        `No skills found for role: ${role}, tags: ${skillTags}`,
      );
    }
    return {
      role,
      tags: formattedTags,
      skills: skillsWithTags,
      groupedCommonSkills, // common skills grouped by mainSkill
    };

  }
}
