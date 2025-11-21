import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExameService } from './exame.service';
import { DicomModalidade, PaginatedResponse, Exame, CreateExameRequest } from '../../../core/models/medical.model';

describe('ExameService', () => {
  let service: ExameService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/exames';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExameService]
    });
    service = TestBed.inject(ExameService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve criar o serviço', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll - Obter todos os exames', () => {
    it('deve buscar todos os exames sem paginação', () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            paciente: { id: 'p1', nome: 'João', documento: '123', dataNascimento: '1990-01-01' },
            modalidade: DicomModalidade.CR,
            dataExame: '2025-11-21',
            descricao: 'Raio-X de tórax',
            idempotencyKey: 'key-1'
          }
        ],
        total: 1,
        page: 1,
        pageSize: 100,
        totalPages: 1
      };

      service.getAll().subscribe(result => {
        expect(result).toEqual(mockResponse as any);
        expect(result.data.length).toBe(1);
      });

      const req = httpMock.expectOne(req => req.url === apiUrl && req.params.get('page') === '1');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('deve conter paciente com dados completos', () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            paciente: { id: 'p1', nome: 'Maria', documento: '456', dataNascimento: '1985-05-15' },
            modalidade: DicomModalidade.CT,
            dataExame: '2025-11-20',
            idempotencyKey: 'key-2'
          }
        ],
        total: 1,
        page: 1,
        pageSize: 100,
        totalPages: 1
      };

      service.getAll().subscribe(result => {
        expect(result.data[0].paciente.nome).toBe('Maria');
        expect(result.data[0].modalidade).toBe(DicomModalidade.CT);
      });

      const req = httpMock.expectOne(req => req.url === apiUrl && req.params.get('page') === '1');
      req.flush(mockResponse);
    });
  });

  describe('create - Criar novo exame', () => {
    it('deve criar um novo exame com sucesso', () => {
      const novoExame: CreateExameRequest = {
        pacienteId: 'p1',
        modalidade: DicomModalidade.MR,
        dataExame: '2025-11-25',
        descricao: 'RMN de cabeça',
        idempotencyKey: 'key-unique-123'
      };

      const mockResponse: Exame = {
        id: 'e1',
        paciente: { id: 'p1', nome: 'João', documento: '123', dataNascimento: '1990-01-01' },
        ...novoExame
      };

      service.create(novoExame, novoExame.idempotencyKey).subscribe(result => {
        expect(result).toEqual(mockResponse as any);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(novoExame);
      req.flush(mockResponse);
    });

    it('deve retornar erro ao criar exame com paciente inexistente', () => {
      const novoExame: CreateExameRequest = {
        pacienteId: 'inexistente',
        modalidade: DicomModalidade.CT,
        dataExame: '2025-11-25',
        idempotencyKey: 'key-456'
      };

      service.create(novoExame, novoExame.idempotencyKey).subscribe(
        () => fail('deveria ter falhado'),
        (error) => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.flush('Paciente não encontrado', { status: 404, statusText: 'Not Found' });
    });

    it('deve retornar erro ao usar mesma chave de idempotência (prevenção de duplicação)', () => {
      const novoExame: CreateExameRequest = {
        pacienteId: 'p1',
        modalidade: DicomModalidade.US,
        dataExame: '2025-11-25',
        idempotencyKey: 'key-duplicate'
      };

      service.create(novoExame, novoExame.idempotencyKey).subscribe(
        () => fail('deveria ter falhado'),
        (error) => {
          expect(error.status).toBe(409);
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.flush('Exame já existe', { status: 409, statusText: 'Conflict' });
    });
  });

  describe('Modalidades DICOM', () => {
    it('deve suportar todas as modalidades DICOM', () => {
      const modalidades = ['CR', 'CT', 'DX', 'MG', 'MR', 'NM', 'OT', 'PT', 'RF', 'US', 'XA'];
      
      modalidades.forEach(modalidade => {
        const exame: CreateExameRequest = {
          pacienteId: 'p1',
          modalidade: modalidade as any as DicomModalidade,
          dataExame: '2025-11-25',
          idempotencyKey: `key-${modalidade}`
        };

        service.create(exame, exame.idempotencyKey).subscribe();

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.body.modalidade).toBe(modalidade);
        req.flush({});
      });
    });
  });

  describe('Idempotência', () => {
    it('deve usar idempotencyKey para evitar duplicações', () => {
      const idempotencyKey = 'unique-key-12345';
      const exame: CreateExameRequest = {
        pacienteId: 'p1',
        modalidade: DicomModalidade.CT,
        dataExame: '2025-11-25',
        idempotencyKey: idempotencyKey
      };

      service.create(exame, idempotencyKey).subscribe();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.body.idempotencyKey).toBe(idempotencyKey);
      req.flush({});
    });

    it('requisições com mesma idempotencyKey devem ser rejeitadas', () => {
      const idempotencyKey = 'same-key';
      const exame: CreateExameRequest = {
        pacienteId: 'p1',
        modalidade: DicomModalidade.MR,
        dataExame: '2025-11-25',
        idempotencyKey: idempotencyKey
      };

      // Primeira requisição
      service.create(exame, idempotencyKey).subscribe();
      let req = httpMock.expectOne(apiUrl);
      req.flush({ id: 'e1' });

      // Segunda requisição com mesma chave
      service.create(exame, idempotencyKey).subscribe(
        () => fail('deveria ter falhado'),
        (error) => {
          expect(error.status).toBe(409);
        }
      );

      req = httpMock.expectOne(apiUrl);
      req.flush('Exame já existe', { status: 409, statusText: 'Conflict' });
    });
  });

  describe('Validações', () => {
    it('deve validar que dataExame é obrigatória', () => {
      const invalidExame = {
        pacienteId: 'p1',
        modalidade: DicomModalidade.CT,
        descricao: 'Teste',
        idempotencyKey: 'key-1'
      };

      service.create(invalidExame as any, 'key-1').subscribe(
        () => fail('deveria ter falhado'),
        (error) => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.flush('Data do exame é obrigatória', { status: 400, statusText: 'Bad Request' });
    });

    it('deve validar que modalidade é uma opção válida', () => {
      const invalidExame: CreateExameRequest = {
        pacienteId: 'p1',
        modalidade: 'INVALID' as any,
        dataExame: '2025-11-25',
        idempotencyKey: 'key-1'
      };

      service.create(invalidExame, invalidExame.idempotencyKey).subscribe(
        () => fail('deveria ter falhado'),
        (error) => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.flush('Modalidade inválida', { status: 400, statusText: 'Bad Request' });
    });
  });
});
