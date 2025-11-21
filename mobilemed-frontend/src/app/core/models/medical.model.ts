export enum DicomModalidade {
  CR = 'CR', CT = 'CT', DX = 'DX', MG = 'MG',
  MR = 'MR', NM = 'NM', OT = 'OT', PT = 'PT',
  RF = 'RF', US = 'US', XA = 'XA'
}

export interface PaginatedResponse<T> {
  data: T[];       // Ou 'content', dependendo do seu backend
  total: number;    // Total de registros no banco
  page: number;     // Página atual
  limit: number; // Itens por página
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