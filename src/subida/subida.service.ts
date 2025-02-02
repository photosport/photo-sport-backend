import { Injectable } from '@nestjs/common';
import { CreateSubidaDto } from './dto/create-subida.dto';
import { UpdateSubidaDto } from './dto/update-subida.dto';

@Injectable()
export class SubidaService {
  create(createSubidaDto: CreateSubidaDto) {
    return 'This action adds a new subida';
  }

  findAll() {
    return `This action returns all subida`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subida`;
  }

  update(id: number, updateSubidaDto: UpdateSubidaDto) {
    return `This action updates a #${id} subida`;
  }

  remove(id: number) {
    return `This action removes a #${id} subida`;
  }
}
