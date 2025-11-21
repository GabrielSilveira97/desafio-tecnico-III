import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  HttpCode,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ExamesService } from './exames.service';
import { CreateExameDto } from './dto/create-exame.dto';
import { QueryExamesDto } from './dto/query-exame.dto';

@Controller('exames')
export class ExamesController {
  constructor(private readonly examsService: ExamesService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() body: CreateExameDto) {

    if (!body.idempotencyKey || body.idempotencyKey.trim() === '') {
      throw new BadRequestException('idempotencyKey é obrigatório');
    }

    return this.examsService.createExame(body);
  }

  @Get()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getAll(@Query() query: QueryExamesDto) {
    return this.examsService.getExames({
      page: query.page,
      limit: query.limit,
    });
  }
}
