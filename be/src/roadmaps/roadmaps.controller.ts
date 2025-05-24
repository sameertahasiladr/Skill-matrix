import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoadmapsService } from './roadmaps.service';

@Controller('roadmaps')
export class RoadmapsController {
  constructor(private readonly roadmapsService: RoadmapsService) {}

  @Get('/:role/:skill')
  async getRoadmap(@Param('role') role: string, @Param('skill') skill: string) {
    console.log('in roadmap controller~~~');
    return this.roadmapsService.createRoadmap(role, skill);
  }
}
