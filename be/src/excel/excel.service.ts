import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as XLSX from 'xlsx';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Levels } from '../skills/entities/levels.entity';
import { SkillMatrix } from '../skills/entities/skillMatrix.entity';
import { Tags } from '../skills/entities/tags.entity';
import { TagSkills } from '../skills/entities/tagskills.entity';
import { Designation } from '../master/entities/designation.entity';
import { MainSkill } from '../master/entities/mainskill.entity';
import { Legend } from '../master/entities/legend.entity';
import { Role } from '../master/entities/role.entity';
import { LevelEnum, MainSkillEnum } from './mapping.enum';
import * as fs from 'fs';
import { User } from '../user/entities/user.entity';
import { Employee } from '../employee/entities/employee.entity';
import * as bcrypt from 'bcrypt';
import { DesignationEnum } from './designation.enum';
import { UserService } from '../user/user.service';

@Injectable()
export class ExcelService {
  private readonly logger = new Logger(ExcelService.name);

  constructor(
    @InjectRepository(Levels)
    private readonly levelsRepository: Repository<Levels>,

    @InjectRepository(SkillMatrix)
    private readonly skillsRepository: Repository<SkillMatrix>,

    @InjectRepository(Tags)
    private readonly tagsRepository: Repository<Tags>,

    @InjectRepository(TagSkills)
    private readonly tagSkillsRepository: Repository<TagSkills>,

    @InjectRepository(Designation)
    private readonly designationRepository: Repository<Designation>,

    @InjectRepository(MainSkill)
    private readonly mainSkillRepository: Repository<MainSkill>,

    @InjectRepository(Legend)
    private readonly legendRepository: Repository<Legend>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  // to clean a string and remove all special characters
  async cleanStrings(originalStr: string) {
    const cleanedStr = await originalStr
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();
    return cleanedStr;
  }

  // to map it to enum
  async mapMainSkill(originalStr: string) {
    const mappedStr = MainSkillEnum[originalStr];
    return mappedStr;
  }

  // to map it to designation
  async mapDesignation(originalStr: string) {
    const mappedStr = DesignationEnum[originalStr];
    return mappedStr;
  }

  // to map it to level enum
  async mapLevel(originalStr: string) {
    const mappedStr = LevelEnum[originalStr];
    return mappedStr;
  }

  // converts excel serial date to JS date object
  convertToJSDate(serialNumber: number): Date {
    const excelEpoch = new Date(1899, 11, 30);
    const jsDate = new Date(excelEpoch.getTime() + serialNumber * 86400000);
    return jsDate;
  }
  
  // validate if correct files are being uploaded
  async validExcelFile(fileBuffer: Buffer, expectedFields: string[]) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    let sheetNames = workbook.SheetNames;
    console.log(sheetNames);

    // for legend sheet
    if (sheetNames.includes('Legend')) {
      const legendSheet = workbook.Sheets['Legend'];

      // extract only the column headers
      const columns: string[] = XLSX.utils.sheet_to_json(legendSheet, {
        header: 1,
      })[0] as string[];

      let expectedLegendFields = ['Level', 'Role', 'Designation'];
      const currentLegendFields = expectedLegendFields.filter(
        (header) => !columns.includes(header),
      );

      if (currentLegendFields.length > 0) {
        throw new HttpException(
          { message: `File upload failed. Missing required columns or invalid file.` },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // check column headers for employee/skill files
    sheetNames = sheetNames.filter((name) => name !== 'Legend');
    console.log('sheets: ', sheetNames);

    for (const sheetName of sheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const columns: string[] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
      })[0] as string[];

      const currentFields = expectedFields.filter(
        (header) => !columns.includes(header),
      );

      console.log('current filed:', currentFields);

      if (currentFields.length > 0) {
        throw new HttpException(
          {
            message: `File upload failed. Missing required columns or invalid file.`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  /**
   * Uploads and processes an Excel file (buffer). We have:
   *  - A "Legend" sheet with TWO tables:
   *      1) Columns A & B (indexes 0,1) for Levels
   *         (Level, Description)
   *      2) Columns F, G, H, I (indexes 5,6,7,8) for Master
   *         (Designation, Role, Main Skill, Description)
   *
   *  - Other sheets with skill data. For each row, we read:
   *      Role, Main Skill, Skill,
   *      Junior Developer, Developer, Senior Developer,
   *      JD-Responsibilities, D-Responsibilities, SR-Responsibilities,
   *      Description (skill desc), Examples, Tags
   *
   * The code:
   *  1) Reads the Legend sheet as a 2D array (header: 1).
   *  2) Builds:
   *     - levelMapping[levelName] = levelDescription
   *     - masterMapping["Designation|Role|MainSkill"] = masterDescription
   *  3) Processes each data sheet row to create Master, Levels, Skills, etc.
   *     - Levels.description is taken from levelMapping
   *     - Master.description is taken from masterMapping
   */

  async processSkillMatrixFile(filePath: string) {
    this.logger.log('Processing uploaded Excel file (alternative logic)...');

    // read the file into a buffer
    const fileBuffer = fs.readFileSync(filePath);

    // define upload summary variables
    let insertedRowCount = 0;
    let updatedRowCount = 0;
    let failedCount = 0;
    let skippedRowCount = 0;
    let sheetsProcessedCount = 0;
    let sheetsSkippedCount = 0;

    // Read workbook
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    this.logger.log(`Found sheets: ${sheetNames.join(', ')}`);

    // Mappings
    // creates an object where <key, value> are of type string
    const levelMapping: Record<string, string> = {}; // For Levels table
    const legendMapping: Record<string, string> = {}; // For Legend table

    // ---------------------------------------------------
    // 1) Parse the "Legend" sheet (if it exists) as a 2D array and save the data into db
    // ---------------------------------------------------
    if (sheetNames.includes('Legend')) {
      this.logger.log(
        'Parsing "Legend" sheet (columns A,B for Levels and F,G,H,I for Legend)...',
      );
      const legendSheet = workbook.Sheets['Legend'];

      // Convert to array of arrays (header: 1 => considers first row as the table header)
      let legendAoA: any[][] = XLSX.utils.sheet_to_json(legendSheet, {
        header: 1,
        defval: '',
      });

      // remove the table header content
      legendAoA = legendAoA.slice(1);

      // Each row is an array. We'll assume:
      //  row[0] -> Level (string)
      //  row[1] -> Level Description
      //
      //  row[4] -> Designation
      //  row[5] -> Role
      //  row[6] -> Main Skill
      //  row[7] -> Legend Description
      //
      // If those columns are empty, we skip them.

      for (const row of legendAoA) {
        // Safety check
        if (!Array.isArray(row)) return;

        // 1a) Check columns A,B (index 0,1) for Level data
        // extracts values from colA (indx0) and trims it => levelVal
        let levelVal = (row[0] || '').trim();
        // extracts values from colB (indx1) and trims it => levelDesc
        const levelDesc = (row[1] || '').trim();

        if (levelVal) {
          // clean and map the levelval
          levelVal = await this.cleanStrings(levelVal);
          levelVal = await this.mapLevel(levelVal);

          // entry is created with levelVal as the key and levelDesc as the value
          levelMapping[levelVal] = levelDesc;
          this.logger.log(`Level mapping: "${levelVal}" => "${levelDesc}"`);
        }

        // 1b) Check columns F,G,H,I (index 5,6,7,8) for Master data
        let designationTitle = (row[4] || '').trim();
        const roleTitle = (row[5] || '').trim();
        let mainSkillTitle = (row[6] || '').trim();
        const legendDescription = (row[7] || '').trim();

        // to clean and map the mainskillTitle
        if (mainSkillTitle) {
          mainSkillTitle = await this.cleanStrings(mainSkillTitle);
          mainSkillTitle = await this.mapMainSkill(mainSkillTitle);
        }

        // to clean and map designationTitle
        designationTitle = await this.cleanStrings(designationTitle);
        designationTitle = await this.mapDesignation(designationTitle);

        if (
          designationTitle ||
          roleTitle ||
          mainSkillTitle ||
          legendDescription
        ) {
          // Build key: "Designation|Role|MainSkill" => "Junior Developer|Backend|NestJS"
          const legendKey = `${designationTitle}|${roleTitle}|${mainSkillTitle}`;
          legendMapping[legendKey] = legendDescription;
          this.logger.log(
            `Master mapping: [${legendKey}] => "${legendDescription}"`,
          );
        }
      }

      // 1c) save legends data into the database
      try {
        // 1ci) level data => levels table
        for (const [levelValue, levelDescription] of Object.entries(
          levelMapping,
        )) {
          // find if this level value exist
          let level = await this.levelsRepository.findOne({
            where: { level: levelValue },
          });

          try {
            // if exist, update; else create a new entry
            if (level) {
              level.description = levelDescription;
              await this.levelsRepository.save(level);

              updatedRowCount++; // increment updated row count
              this.logger.log(`Updated Level: ${levelValue}`);
            } else {
              level = new Levels();
              level.level = levelValue;
              level.description = levelDescription;
              await this.levelsRepository.save(level);

              insertedRowCount++; // increment inserted row count
              this.logger.log(`Saved Level: ${levelValue}`);
            }
          } catch (error) {
            failedCount++; // increment failed row cont
            this.logger.error(
              `Error processing row:{ ${levelValue} | ${levelDescription} }`,
              error,
            );
          }
        }

        // 1cii) save legend table data
        for (const [legendKey, legendDescription] of Object.entries(
          legendMapping,
        )) {
          // deconstruct master key with '|' as delimiter
          const [designationVal, roleTitle, mainSkillStr] =
            legendKey.split('|');

          try {
            // 1) Find or create the Role
            let role = await this.roleRepository.findOne({
              where: { title: roleTitle },
            });

            if (role) {
              skippedRowCount++; // increment skipped row count
            } else if (!role && roleTitle) {
              // create a new entry if role doesnt exist and roleTitle is not empty
              role = this.roleRepository.create({ title: roleTitle });
              role = await this.roleRepository.save(role);
              insertedRowCount++; // increment inserted row count
            } else if (!roleTitle) {
              // else if roleTitle is empty, pass role as empty too
              role = null;
            }

            // 2) Find or create the MainSkill
            let mainSkill = await this.mainSkillRepository.findOne({
              where: { mainSkill: mainSkillStr },
            });
            if (mainSkill) {
              skippedRowCount++; // increment skipped row count
            } else if (!mainSkill && mainSkillStr) {
              // create a new entry if mainSkill doesnt exist and mainSkillStr is not empty
              mainSkill = this.mainSkillRepository.create({
                mainSkill: mainSkillStr,
              });
              mainSkill = await this.mainSkillRepository.save(mainSkill);
              insertedRowCount++; // increment inserted row count
            } else if (!mainSkillStr) {
              // else if mainSkillStr is empty, pass mainSkill as empty too
              mainSkill = null;
            }

            // 3) Find or create Designation
            let designation = await this.designationRepository.findOne({
              where: { designation: designationVal },
            });

            if (designation) {
              skippedRowCount++; // increment skipped row count
            } else if (!designation) {
              // if doesn't exist, create the designation
              designation = this.designationRepository.create({
                designation: designationVal,
              });
              designation = await this.designationRepository.save(designation);
              insertedRowCount++; // increment inserted row count
            }

            // 4) Find or create Legend
            let legend = await this.legendRepository.findOne({
              where: {
                designation,
                // if role/mainSkill is not null, then pass that value, else create as null
                role: role ? role : IsNull(),
                mainSkill: mainSkill ? mainSkill : IsNull(),
              },
            });

            // if exist, update the details of the existing entry; else create a new entry
            if (legend) {
              legend.role = role;
              legend.mainSkill = mainSkill;
              legend.designation = designation;
              legend.description = legendDescription;
              legend = await this.legendRepository.save(legend);
              updatedRowCount++; // increment updated row count
            } else if (!legend) {
              legend = this.legendRepository.create({
                role: role,
                mainSkill: mainSkill,
                designation: designation,
                description: legendDescription,
              });
              legend = await this.legendRepository.save(legend);
              insertedRowCount++; // increment inserted row count
              this.logger.log(
                `Created Master: [role="${roleTitle}", mainSkill="${mainSkillStr}", designation="${designationVal}"] desc="${legendDescription}"`,
              );
            }
          } catch (error) {
            failedCount++; // increment failed row count
            this.logger.error(
              `Error processing row: { ${designationVal} | ${roleTitle} | ${mainSkillStr} }`,
              error,
            );
          }
        }
        sheetsProcessedCount++; // increment sheets processed count
      } catch (error) {
        this.logger.error(`Error processing the data`, error);
      }
    } else {
      this.logger.warn('No "Legend" sheet found.');
    }

    // ---------------------------------------------------
    // 2) Process all other sheets (the data sheets)
    // ---------------------------------------------------
    for (const sheetName of sheetNames) {
      if (sheetName === 'Legend') continue; // skip the Legend sheet

      this.logger.log(`Processing data sheet: "${sheetName}"`);
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) {
        this.logger.warn(`Sheet "${sheetName}" is empty, skipping.`);
        sheetsSkippedCount++; // increment skipped sheet count
        continue;
      }

      // convert sheet into an array of json objs
      // defval => default value for cells that are empty; here they'll be empty strings ("Name":"")
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      // this.logger.log(`Found ${rows.length} rows in sheet "${sheetName}".`);

      let orderNo = 0; // reset order no to zero for each sheet
      console.log(`sheet order no: ${orderNo}`);
      for (const row of rows) {
        orderNo++; // increment the order no
      
        try {
          // Basic columns
          // extract value associated with the key 'Role'/''Main Skill'/.. from a single row
          const roleTitle: string = (row['Role'] || '').trim();
          let mainSkillStr: string = row['Main Skill'] || '';
          const skillStr: string = (row['Skill'] || '').trim();
          const skillDescription: string = (row['Description'] || '').trim();
          const examples: string = (row['Examples'] || '').trim();
          const tagsStr: string = (row['Tags'] || '').trim();

          // clean the mainskillstr and map it
          if (mainSkillStr) {
            mainSkillStr = await this.cleanStrings(mainSkillStr);
            mainSkillStr = await this.mapMainSkill(mainSkillStr);
          }

          // Per-designation columns
          // extract data from the row of these columns
          const designationsData = [
            {
              designation: 'Junior Developer',
              levelValue: row['Junior Developer'],
              responsibilities: row['JD-Responsibilities'],
            },
            {
              designation: 'Developer',
              levelValue: row['Developer'],
              responsibilities: row['D-Responsibilities'],
            },
            {
              designation: 'Senior Developer',
              levelValue: row['Senior Developer'],
              responsibilities: row['SR-Responsibilities'],
            },
          ];

          // 1) Find or create the Role
          let role = await this.roleRepository.findOne({
            where: { title: roleTitle },
          });
          if (!role) {
            role = this.roleRepository.create({ title: roleTitle });
            role = await this.roleRepository.save(role);
            insertedRowCount++; // increment inserted row count
            // this.logger.log(`Created Role: "${roleTitle}"`);
          }

          // 2) Find or create the MainSkill
          let mainSkill = await this.mainSkillRepository.findOne({
            where: { mainSkill: mainSkillStr },
          });

          if (!mainSkill) {
            mainSkill = this.mainSkillRepository.create({
              mainSkill: mainSkillStr,
            });
            mainSkill = await this.mainSkillRepository.save(mainSkill);
            insertedRowCount++; // increment inserted row count
            // this.logger.log(`Created MainSkill: "${mainSkillStr}"`);
          }

          // 3) For each of the 3 designations (Junior, Developer, Senior)
          for (const d of designationsData) {
            // to clean and map levelValue
            d.levelValue = await this.cleanStrings(d.levelValue);
            d.levelValue = await this.mapLevel(d.levelValue);

            if (
              !d.levelValue ||
              !d.designation ||
              d.responsibilities == 'N/A' ||
              d.responsibilities == 'NULL' ||
              d.levelValue == 'N/A' ||
              d.levelValue == 'NULL'
            ) {
              skippedRowCount++; // increment skipped row count
              continue; // skip if no there is no level/designation/responsibilities
            }

            // 3a) Find or create Designation
            let designation = await this.designationRepository.findOne({
              where: { designation: d.designation },
            });
            
            if (!designation) {
              designation = this.designationRepository.create({
                designation: d.designation,
              });
              designation = await this.designationRepository.save(designation);
              insertedRowCount++; // increment inserted row count
              // this.logger.log(`Created Designation: "${d.designation}"`);
            }

            // 3b) Find or create the Levels record
            let levelEntity = await this.levelsRepository.findOne({
              where: { level: d.levelValue },
            });

            if (!levelEntity) {
              const levelDesc = levelMapping[d.levelValue] || '';
              levelEntity = this.levelsRepository.create({
                level: d.levelValue,
                description: levelDesc,
              });
              levelEntity = await this.levelsRepository.save(levelEntity);
              insertedRowCount++; // increment inserted row count
              // this.logger.log(
              //   `Created Level: "${d.levelValue}" desc="${levelDesc}"`,
              // );
            }

            // 3c) Create the Skill record
            let skill = await this.skillsRepository.findOne({
              where: {
                levels: levelEntity,
                mainSkill: mainSkill,
                role: role,
                designation: designation,
                skills: skillStr,
              },
            });

            try {
              // if exists, update the skill entry
              // else, create a new entry
              if (skill) {
                skill.description = skillDescription;
                skill.example = examples;
                skill.responsibilities = d.responsibilities;
                skill = await this.skillsRepository.save(skill);

                updatedRowCount++; // increment updated row count
                this.logger.log(
                  `Updated Skill: "${skillStr}" 
                  Designation="${d.designation}", 
                  Level="${d.levelValue}"`,
                );
              } else {
                const skillData = this.skillsRepository.create({
                  skills: skillStr,
                  description: skillDescription,
                  example: examples,
                  responsibilities: d.responsibilities,
                  levels: levelEntity,
                  mainSkill: mainSkill,
                  role: role,
                  designation: designation,
                  orderNo: orderNo,
                  isVisible: true,
                });
                skill = await this.skillsRepository.save(skillData);
                insertedRowCount++; // increment inserted row count
                this.logger.log(
                  `Created Skill: "${skillStr}" (Designation="${d.designation}", Level="${d.levelValue}")`,
                );
              }

              // 3d) Process Tags
              if (tagsStr) {
                // split into an array of individual tags
                const tagNames = tagsStr
                  .split(/;|,/)
                  .map((t: string) => t.trim())
                  .filter((t: string) => t !== '');

                for (const tagName of tagNames) {
                  // removes the '#' from the tag
                  const cleanedTag = tagName.startsWith('#')
                    ? tagName.slice(1).replace(/[^a-zA-Z0-9]/g, '')
                    : tagName.replace(/[^a-zA-Z0-9]/g, '');

                  if (cleanedTag) {
                    // find or create the tag
                    let tag = await this.tagsRepository.findOne({
                      where: { tags: cleanedTag },
                    });

                    try {
                      if (!tag) {
                        tag = this.tagsRepository.create({ tags: cleanedTag });
                        tag = await this.tagsRepository.save(tag);
                        insertedRowCount++; // increment inserted row count
                        this.logger.log(`Created Tag: "${cleanedTag}"`);
                      }

                      const tagSkillExist =
                        await this.tagSkillsRepository.findOne({
                          where: {
                            skills: skill,
                            tags: tag,
                          },
                        });

                      // if exists skip; else create a new entry
                      if (tagSkillExist) {
                        skippedRowCount++; // increment skipped row count
                      } else {
                        // create the record and save the skill and tags into tagSkill table
                        const tagSkill = this.tagSkillsRepository.create({
                          skills: skill,
                          tags: tag,
                        });
                        await this.tagSkillsRepository.save(tagSkill);
                        insertedRowCount++; // increment inserted row count
                        this.logger.log(
                          `Linked Skill="${skillStr}" with Tag="${cleanedTag}"`,
                        );
                      }
                    } catch (error) {
                      failedCount++; // increment failed row count
                      this.logger.log(
                        `Failed to save the tagskill: "${skill} | ${tag}" `,
                      );
                    }
                  } else {
                    this.logger.warn(`Empty tag is skipped`);
                  }
                }
              }
            } catch (error) {
              failedCount++; // increment failed row count
              this.logger.log(
                `Failed to save the skill: "${skillStr}" (Designation="${d.designation}", Level="${d.levelValue}")`,
              );
            }
          } // end for each designation
        } catch (error) {
          this.logger.error(
            `Error processing row: ${JSON.stringify(row)}`,
            error,
          );
        }
      } // end for each row
      sheetsProcessedCount++; // increment sheets processed count
    } // end for each sheet

    this.logger.log('Excel import completed (alternative logic).');

    const uploadSummary = {
      insertedRowCount: insertedRowCount,
      updatedRowCount: updatedRowCount,
      failedCount: failedCount,
      skippedRowCount: skippedRowCount,
      sheetsProcessedCount: sheetsProcessedCount,
      sheetsSkippedCount: sheetsSkippedCount,
    };

    this.logger.log(`The upload summary is: 
      insertedRowCount: ${insertedRowCount},
      updatedRowCount: ${updatedRowCount},
      failedCount: ${failedCount},
      skippedRowCount: ${skippedRowCount},
      sheetsProcessedCount: ${sheetsProcessedCount},
      sheetsSkippedCount: ${sheetsSkippedCount}`);

    return uploadSummary;
  }

  async processEmployeeFile(filePath: string) {
    this.logger.log('Processing uploaded Excel file (alternative logic)...');

    // read the file into a buffer
    const fileBuffer = fs.readFileSync(filePath);

    // define upload summary variables
    let insertedRowCount = 0;
    let updatedRowCount = 0;
    let failedCount = 0;
    let skippedRowCount = 0;
    let sheetsProcessedCount = 0;
    let sheetsSkippedCount = 0;

    // set and hash a default password
    const defaultPwd = 'Test@123@CCI';
    const hashPwd = await bcrypt.hash(defaultPwd, 10);

    // Read workbook
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    this.logger.log(`Found sheets: ${sheetNames.join(', ')}`);

    // ---------------------------------------------------
    // Process the employee sheet(s)
    // ---------------------------------------------------
    for (const sheetName of sheetNames) {
      this.logger.log(`Processing data sheet: "${sheetName}"`);
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) {
        this.logger.warn(`Sheet "${sheetName}" is empty, skipping.`);
        sheetsSkippedCount++; // increment skipped sheet count
        continue;
      }

      // convert sheet into an array of json objs
      // defval => default value for cells that are empty; here they'll be empty strings ("Name":"")
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      this.logger.log(`Found ${rows.length} rows in sheet "${sheetName}".`);

      for (const row of rows) {
        try {
          // 1. fetch the data from one entire row
          const empName: string = (row['Employee Name'] || '').trim();
          const empCCIid: string = row['Employee Number'] || '';
          const email: string = (row['Email'] || '').trim();
          const dateOfJoiningRaw: Date = row['Date Of Joining'] || '';
          const reportingTo: string = (row['Reporting To'] || '').trim();
          const currentGrade: string = (row['Curr.Grade'] || '').trim();
          const currentLocation: string = (row['Curr.Location'] || '').trim();
          const presentCity: string = (row['Present City'] || '').trim();
          const presentState: string = (row['Present State'] || '').trim();
          const currDept: string = (row['Curr.Department'] || '').trim();
          let currDesignation = row['Curr.Designation'] || '';
          const currDesgnForReporting: string = (
            row['Curr.Designationforreporting'] || ''
          ).trim();
          let dateOfLeaving = row['Leaving Date'] || '';
          const currClient1: string = (row['Curr.Client1'] || '').trim();
          const currClient2: string = (row['Curr.Client2'] || '').trim();
          const currClient3: string = (row['Curr.Client3'] || '').trim();
          const currClient4: string = (row['Curr.Client4'] || '').trim();
          let currExperience: number | null = (
            row['Current Experience (year/ Month)'] || ''
          ).trim();
          let currPrevEmpExp: number | null = (
            row['Curr.Previousemployerexperience'] || ''
          ).trim();
          let yrsServedCurrDesign: number | null = (
            row['Years Served In Curr.Designation'] || ''
          ).trim();
          const currDesignSinceRaw: Date = row['Curr.Designation Since'] || '';
          const currBusinessSysQualification: string = (
            row['Curr.Businesssystemsqualifications'] || ''
          ).trim();
          const currCoreTech: string = (row['Curr.Coretechstack'] || '').trim();
          const currSecondaryCoreTech: string = (
            row['Curr.Secondarytechstack'] || ''
          ).trim();
          const currPersonalInterests: string = (
            row['Curr.Personalinterests'] || ''
          ).trim();
          const employmentStatus: string = (
            row['Employment Status'] || ''
          ).trim();
          const userGrp: string = (row['Usergroup'] || '').trim();

          // 2. convert all dates into a readable formate
          // convert date of joining
          const dateOfJoining: Date =
            typeof dateOfJoiningRaw === 'number'
              ? this.convertToJSDate(dateOfJoiningRaw)
              : new Date(dateOfJoiningRaw);

          // convert curr. designation since date
          const currDesignSince: Date =
            typeof currDesignSinceRaw === 'number'
              ? this.convertToJSDate(currDesignSinceRaw)
              : new Date(currDesignSinceRaw);

          // if not null, convert date of leaving; else, assign null value
          if (dateOfLeaving) {
            dateOfLeaving =
              typeof dateOfLeaving === 'number'
                ? this.convertToJSDate(dateOfLeaving)
                : new Date(dateOfLeaving);
          } else {
            dateOfLeaving = null;
          }

          // 3. if value is null, assign null
          if (!currPrevEmpExp) currPrevEmpExp = null;
          if (!currExperience) currExperience = null;
          if (!yrsServedCurrDesign) yrsServedCurrDesign = null;

          // 4a) clean current designation value + map it
          currDesignation = await this.cleanStrings(currDesignation);
          currDesignation = await this.mapDesignation(currDesignation);

          // 4b) fetch the designation id
          let currDesign = await this.designationRepository.findOne({
            where: {
              designation: currDesignation,
            },
          });

          // 4c) if exists, skip; else create a new designation entry
          if (currDesign) {
            skippedRowCount++; // increment skipped row count
          } else if (!currDesign) {
            // if doesn't exist, create the designation
            currDesign = this.designationRepository.create({
              designation: currDesignation,
            });
            currDesign = await this.designationRepository.save(currDesign);
            insertedRowCount++; // increment inserted row count
          }

          // 5. find user with that particular cci_id
          const user = await this.userRepository.findOne({
            where: {
              cci_id: empCCIid,
            },
          });

          // if exist, check if emp_id is null
          if (user) {
            // fetch the emp_id associated with this user
            const emp = await this.employeeRepository.findOne({
              where: { id: user.employee?.id },
            });

            // if employee exists; update the details
            if (emp) {
              if (dateOfJoining) emp.date_of_joining = dateOfJoining;
              if (reportingTo) emp.reporting_to = reportingTo;
              if (currentGrade) emp.current_grade = currentGrade;
              if (currentLocation) emp.current_location = currentLocation;
              if (presentCity) emp.present_city = presentCity;
              if (presentState) emp.present_state = presentState;
              if (currDept) emp.current_dept = currDept;
              emp.current_designation = currDesign;
              if (currDesgnForReporting)
                emp.curr_designation_for_reporting = currDesgnForReporting;
              if (dateOfLeaving) emp.date_of_leaving = dateOfLeaving;
              if (currClient1) emp.current_client_one = currClient1;
              if (currClient2) emp.current_client_two = currClient2;
              if (currClient3) emp.current_client_three = currClient3;
              if (currClient4) emp.current_client_four = currClient4;
              if (currExperience) emp.current_experience = currExperience;
              if (currPrevEmpExp) emp.prev_emp_experience = currPrevEmpExp;
              if (yrsServedCurrDesign)
                emp.years_served_in_curr_designation = yrsServedCurrDesign;
              if (currDesignSince) emp.curr_designation_since = currDesignSince;
              if (currBusinessSysQualification)
                emp.current_business_sys_qualifications =
                  currBusinessSysQualification;
              if (currCoreTech) emp.current_core_tech_stack = currCoreTech;
              if (currSecondaryCoreTech)
                emp.current_secondary_tech_stack = currSecondaryCoreTech;
              if (currPersonalInterests)
                emp.personal_interests = currPersonalInterests;
              if (employmentStatus) emp.employment_status = employmentStatus;
              if (userGrp) emp.user_group = userGrp;

              try {
                await this.employeeRepository.save(emp);
                updatedRowCount++; // increment updated row count
              } catch (error) {
                failedCount++; // increment failed row count
                this.logger.error(
                  `Failed to save employee details into database. ${error}`,
                );
              }
            } else {
              // else, create a new employee entry and assign all the details
              let newEmp;
              try {
                let emp = this.employeeRepository.create({
                  date_of_joining: dateOfJoining,
                  reporting_to: reportingTo,
                  current_grade: currentGrade,
                  current_location: currentLocation,
                  present_city: presentCity,
                  present_state: presentState,
                  current_dept: currDept,
                  current_designation: currDesign,
                  curr_designation_for_reporting: currDesgnForReporting,
                  date_of_leaving: dateOfLeaving,
                  current_client_one: currClient1,
                  current_client_two: currClient2,
                  current_client_three: currClient3,
                  current_client_four: currClient4,
                  current_experience: currExperience,
                  prev_emp_experience: currPrevEmpExp,
                  years_served_in_curr_designation: yrsServedCurrDesign,
                  curr_designation_since: currDesignSince,
                  current_business_sys_qualifications:
                    currBusinessSysQualification,
                  current_core_tech_stack: currCoreTech,
                  current_secondary_tech_stack: currSecondaryCoreTech,
                  personal_interests: currPersonalInterests,
                  employment_status: employmentStatus,
                  user_group: userGrp,
                });

                newEmp = await this.employeeRepository.save(emp);
                insertedRowCount++; // increment inserted row count
              } catch (error) {
                failedCount++; // increment failed row count
                this.logger.error(
                  `Failed to save employee details into the database. ${error}`,
                );
              }
              if (email) user.emp_email = email;
              user.employee = newEmp;

              try {
                await this.userRepository.save(user);
                updatedRowCount++; // increment updated row count
              } catch (error) {
                failedCount++; // increment failed row count
                this.logger.error(
                  `Failed to save user details into database. ${error}`,
                );
              }
            }
          } else {
            // create a new record and save that emp id in the user table

            // 1. create a new employee record & save it to the database
            let newEmp;
            try {
              let emp = this.employeeRepository.create({
                date_of_joining: dateOfJoining,
                reporting_to: reportingTo,
                current_grade: currentGrade,
                current_location: currentLocation,
                present_city: presentCity,
                present_state: presentState,
                current_dept: currDept,
                current_designation: currDesign,
                curr_designation_for_reporting: currDesgnForReporting,
                date_of_leaving: dateOfLeaving,
                current_client_one: currClient1,
                current_client_two: currClient2,
                current_client_three: currClient3,
                current_client_four: currClient4,
                current_experience: currExperience,
                prev_emp_experience: currPrevEmpExp,
                years_served_in_curr_designation: yrsServedCurrDesign,
                curr_designation_since: currDesignSince,
                current_business_sys_qualifications:
                  currBusinessSysQualification,
                current_core_tech_stack: currCoreTech,
                current_secondary_tech_stack: currSecondaryCoreTech,
                personal_interests: currPersonalInterests,
                employment_status: employmentStatus,
                user_group: userGrp,
              });

              newEmp = await this.employeeRepository.save(emp);
              insertedRowCount++; // increment inserted row count
            } catch (error) {
              failedCount++; // increment failed row count
              this.logger.error(
                `Failed to save employee details into the database. ${error}`,
              );
            }

            // 2a) slice the full name and assign first section to first name
            const firstName = empName.split(' ')[0];

            // 2b). assign second half to last name
            const lastName = empName.split(' ').slice(1).join(' ');

            // 3. create a new user + assign emp + save it into the database
            try {
              const newUser = this.userRepository.create({
                cci_id: empCCIid,
                emp_email: email,
                firstName: firstName,
                lastName: lastName,
                password: hashPwd,
                employee: newEmp,
                signup_status: 'Inactive',
              });

              await this.userRepository.save(newUser);
              console.log(`new user created: ${newUser.cci_id}`);
              insertedRowCount++;
            } catch (error) {
              failedCount++; // increment failed row count
              this.logger.error(
                `Failed to save user details into the database. ${error}`,
              );
            }
          }
        } catch (error) {
          failedCount++; // increment failed row count
          this.logger.error(
            `Error processing row: ${JSON.stringify(row)}`,
            error,
          );
        }
      } // end for each row
      sheetsProcessedCount++; // increment sheets processed count
    } // end for each sheet

    // import is complete
    this.logger.log('Excel import completed (alternative logic).');

    const uploadSummary = {
      insertedRowCount: insertedRowCount,
      updatedRowCount: updatedRowCount,
      failedCount: failedCount,
      skippedRowCount: skippedRowCount,
      sheetsProcessedCount: sheetsProcessedCount,
      sheetsSkippedCount: sheetsSkippedCount,
    };

    this.logger.log(`The upload summary is: 
      insertedRowCount: ${insertedRowCount},
      updatedRowCount: ${updatedRowCount},
      failedCount: ${failedCount},
      skippedRowCount: ${skippedRowCount},
      sheetsProcessedCount: ${sheetsProcessedCount},
      sheetsSkippedCount: ${sheetsSkippedCount}`);

    return uploadSummary;
  }
}
