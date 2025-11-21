import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ModalidadeDICOM } from '@prisma/client';
import { CreateExameDto } from './dto/create-exame.dto';
import { QueryExamesDto } from './dto/query-exame.dto';
@Injectable()
export class ExamesService {
  constructor(private prisma: PrismaService) {}

  async createExame(data: CreateExameDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.exame.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
      });

      if (existing) {
        return existing;
      }

      const modalidadeEnum = ModalidadeDICOM[data.modalidade];
      if (!modalidadeEnum) {
        throw new BadRequestException(
          `Modalidade inválida. Use: ${Object.keys(ModalidadeDICOM).join(', ')}`,
        );
      }

      const paciente = await tx.paciente.findUnique({
        where: { id: data.pacienteId },
      });

      if (!paciente) {
        throw new BadRequestException('Paciente não encontrado');
      }

      try {
        return await tx.exame.create({
          data: {
            pacienteId: data.pacienteId,
            idempotencyKey: data.idempotencyKey,
            modalidade: modalidadeEnum,
            dataExame: new Date(data.dataExame),
            descricao: data.descricao,
          },
        });
      } catch (error) {
        if (error.code === 'P2002') {
          throw new ConflictException('idempotencyKey já usada');
        }
        throw error;
      }
    });
  }

  async getExames(params: QueryExamesDto & { pacienteId?: string }) {
    const { page, limit, pacienteId } = params;

    const skip = (page - 1) * limit;
    const where = pacienteId ? { pacienteId } : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.exame.findMany({
        where,
        skip,
        take: limit,
        include: { paciente: true },
        orderBy: { dataExame: 'desc' },
      }),
      this.prisma.exame.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
