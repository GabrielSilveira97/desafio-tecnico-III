import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { QueryPacientesDto } from './dto/query-paciente.dto';

@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Get()
  async getPacientes(@Query() query: QueryPacientesDto) {
    const { page = 1, pageSize = 10 } = query;

    if (page < 1 || pageSize < 1) {
      throw new BadRequestException('page e pageSize devem ser >= 1');
    }

    return this.pacientesService.getPacientes({
      page,
      pageSize,
    });
  }

  @Get(':id')
  async getPacienteById(@Param('id', ParseUUIDPipe) id: string) {
    return this.pacientesService.getPacienteById(id);
  }

  @Post()
  @HttpCode(201)
  createPaciente(@Body() body: CreatePacienteDto) {
    return this.pacientesService.createPaciente(body);
  }

  @Patch(':id')
  async updatePaciente(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdatePacienteDto,
  ) {
    return this.pacientesService.updatePaciente(id, data);
  }

  @Delete(':id')
  async deletePaciente(@Param('id', ParseUUIDPipe) id: string) {
    return this.pacientesService.deletePaciente(id);
  }
}
