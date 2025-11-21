export enum DicomModalidade {
  CR = 'CR', CT = 'CT', DX = 'DX', MG = 'MG',
  MR = 'MR', NM = 'NM', OT = 'OT', PT = 'PT',
  RF = 'RF', US = 'US', XA = 'XA'
}

export interface PaginatedResponse<T> {
  data: T[];       
  total: number;   
  page: number;     
  pageSize: number;
  totalPages: number;
}

export interface Paciente {
  id?: string;  
  nome: string;
  documento: string;     
  dataNascimento: string | Date;
}

export interface Exame {
  id: string;
  paciente: Paciente; 
  modalidade: DicomModalidade;
  dataExame: string | Date;
  descricao?: string;
  idempotencyKey: string
}

export interface CreateExameRequest {
  pacienteId: string;
  modalidade: DicomModalidade;
  dataExame: string | Date;
  descricao?: string;
  idempotencyKey: string;
}