import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Designation } from './entities/designation.entity';
import { CreateDesignationDto } from './dto/create-designation.dto';

@Injectable()
export class DesignationService {
  constructor(
    @InjectRepository(Designation)
    private readonly designationRepository: Repository<Designation>,
  ) {}

  async create(createDesignationDto: CreateDesignationDto): Promise<Designation> {
    const designation = this.designationRepository.create(createDesignationDto);
    return await this.designationRepository.save(designation);
  }

  async findAll(): Promise<Designation[]> {
    return await this.designationRepository.find();
  }
}
