// dto/create-token.dto.ts
import { IsString } from 'class-validator';

export class CreateTokenDto {
  @IsString()
  role: string;

  @IsString()
  designation: string;
}
