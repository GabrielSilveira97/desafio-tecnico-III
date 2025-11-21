import { IsString, IsDateString, Length } from 'class-validator';

export class CreatePacienteDto {
  @IsString()
  @Length(3, 120)
  nome: string;

  @IsString()
  @Length(5, 30)
  documento: string;

  @IsDateString()
  dataNascimento: Date;
}
