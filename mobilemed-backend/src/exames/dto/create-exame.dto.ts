import {
  IsString,
  IsUUID,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ModalidadeDICOM } from '@prisma/client';

export class CreateExameDto {
  @IsUUID()
  pacienteId: string;

  @IsString()
  idempotencyKey: string;

  @IsEnum(ModalidadeDICOM, {
    message: `Modalidade inválida. Use: ${Object.keys(ModalidadeDICOM).join(', ')}`,
  })
  modalidade: ModalidadeDICOM;

  @IsDateString()
  dataExame: Date;

  @IsOptional()
  @IsString()
  descricao?: string;
}
