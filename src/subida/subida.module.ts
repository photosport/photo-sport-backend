import { Module } from '@nestjs/common';
import { SubidaService } from './subida.service';
import { SubidaController } from './subida.controller';

@Module({
  controllers: [SubidaController],
  providers: [SubidaService],
})
export class SubidaModule {}
