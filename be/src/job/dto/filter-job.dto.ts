import { ApiProperty } from "@nestjs/swagger";

export class FilterJobDto {
  @ApiProperty({
    description: 'Filter by job type',
  })
  jobType?: string;
}