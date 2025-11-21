import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';

@Injectable()
export class PacientesService {
  constructor(private prisma: PrismaService) {}

  async getPacientes(params: { page: number; pageSize: number }) {
    const { page, pageSize } = params;
    const skip = (page - 1) * pageSize;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.paciente.findMany({
        skip,
        take: pageSize,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.paciente.count(),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getPacienteById(id: string) {
    const paciente = await this.prisma.paciente.findUnique({
      where: { id },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    return paciente;
  }

  async createPaciente(data: CreatePacienteDto) {
    try {
      return await this.prisma.paciente.create({
        data:{
        ...data,
        dataNascimento: new Date(data.dataNascimento)
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Já existe um paciente com esse documento');
      }
      throw error;
    }
  }

async updatePaciente(id: string, data: UpdatePacienteDto) {
  try {
    const updateData = {
      ...data,
      dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : undefined,
    };

    return await this.prisma.paciente.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundException('Paciente não encontrado');
    }
    if (error.code === 'P2002') {
      throw new ConflictException(
        'Documento já está em uso por outro paciente',
      );
    }
    throw error;
  }
}

async deletePaciente(id: string) {
  const exames = await this.prisma.exame.findFirst({
    where: { pacienteId: id },
  });

  if (exames) {
    throw new ForbiddenException(
      'Não é possível excluir paciente que possui exames cadastrados.'
    );
  }

  try {
    return await this.prisma.paciente.delete({
      where: { id },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundException('Paciente não encontrado');
    }
    throw error;
  }
}

}
