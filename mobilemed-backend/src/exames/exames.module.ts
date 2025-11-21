import { Module } from '@nestjs/common';
import { ExamesController } from './exames.controller';
import { ExamesService } from './exames.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ExamesController],
  providers: [ExamesService],
  imports: [PrismaModule],
})
export class ExamesModule {}
