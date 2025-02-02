import { PartialType } from '@nestjs/swagger';
import { CreateSubidaDto } from './create-subida.dto';

export class UpdateSubidaDto extends PartialType(CreateSubidaDto) {}
