import { Module } from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { PacientesController } from './pacientes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [PacientesController],
  providers: [PacientesService],
  imports: [PrismaModule],
})
export class PacientesModule {}
