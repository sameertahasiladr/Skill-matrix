import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Legend } from './entities/legend.entity';
import { CreateLegendDto } from './dto/create-legend.dto';
import { UpdateMasterDto } from './dto/update-master.dto';
import { Designation } from './entities/designation.entity';
import { Role } from './entities/role.entity';
import { MainSkill } from './entities/mainskill.entity';

@Injectable()
export class MasterService {
  constructor(
    @InjectRepository(Legend)
    private readonly masterRepository: Repository<Legend>,
    @InjectRepository(Designation)
    private readonly designationRepository: Repository<Designation>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(MainSkill)
    private readonly mainSkillRepository: Repository<MainSkill>,
  ) {}

  async create(createMasterDto: CreateLegendDto): Promise<Legend> {
    const designation = await this.designationRepository.findOne({
      where: { id: createMasterDto.designationId },
    });
    const role = await this.roleRepository.findOne({
      where: { id: createMasterDto.roleId },
    });
    const mainSkill = await this.mainSkillRepository.findOne({
      where: { id: createMasterDto.mainSkillId },
    });

    if (!designation || !role || !mainSkill) {
      throw new NotFoundException('Invalid foreign key reference');
    }

    const master = this.masterRepository.create({
      designation,
      role,
      mainSkill,
      description: createMasterDto.description,
    });

    return await this.masterRepository.save(master);
  }

  async findAll(): Promise<Legend[]> {
    return await this.masterRepository.find();
  }

  async findOne(id: string): Promise<Legend> {
    const master = await this.masterRepository.findOne({ where: { id } });
    if (!master) {
      throw new NotFoundException(`Master record with ID ${id} not found`);
    }
    return master;
  }

  async update(id: string, updateMasterDto: UpdateMasterDto): Promise<Legend> {
    const master = await this.findOne(id);
    const updatedMaster = Object.assign(master, updateMasterDto);
    return await this.masterRepository.save(updatedMaster);
  }

  async remove(id: string): Promise<void> {
    await this.masterRepository.delete(id);
  }
  async getById(id: string): Promise<Legend> {
    const master = await this.masterRepository.findOne({
      where: { id },
      relations: ['designation', 'role', 'mainSkill'],
    });

    if (!master) {
      throw new NotFoundException(`Master record with ID ${id} not found`);
    }

    return master;
  }
}
