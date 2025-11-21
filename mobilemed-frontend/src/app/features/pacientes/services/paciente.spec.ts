import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PacienteService } from './paciente.service';
import { Paciente, PaginatedResponse } from '../../../core/models/medical.model';

describe('PacienteService', () => {
  let service: PacienteService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/pacientes';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PacienteService]
    });
    service = TestBed.inject(PacienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve criar o serviço', () => {
    expect(service).toBeTruthy();
  });

  describe('load - Carregar pacientes com paginação', () => {
    it('deve carregar pacientes com paginação', () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            nome: 'João Silva',
            documento: '12345678901',
            dataNascimento: '1990-01-01'
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      };

      service.load(1, 10);

      const req = httpMock.expectOne(req => 
        req.url === apiUrl && 
        req.params.get('page') === '1' && 
        req.params.get('pageSize') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      expect(service.pacientes()).toEqual(mockResponse.data);
      expect(service.page()).toBe(1);
      expect(service.pageSize()).toBe(10);
      expect(service.totalPacientes()).toBe(1);
    });

    it('deve atualizar state quando não há dados na página', () => {
      const mockResponse = {
        data: [],
        total: 10,
        page: 2,
        pageSize: 10,
        totalPages: 1
      };

      service.load(2, 10);

      const req = httpMock.expectOne(req => req.url === apiUrl);
      req.flush(mockResponse);

      expect(service.isLastPage()).toBe(true);
    });
  });

  describe('create - Criar novo paciente', () => {
    it('deve criar um novo paciente com sucesso', () => {
      const novoPaciente: Paciente = {
        nome: 'Maria Santos',
        documento: '98765432100',
        dataNascimento: '1985-05-15'
      };

      const mockResponse: Paciente = {
        id: '123',
        ...novoPaciente
      };

      service.create(novoPaciente).subscribe(result => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(novoPaciente);
      req.flush(mockResponse);
    });

    it('deve retornar erro ao criar paciente com documento duplicado', () => {
      const novoPaciente: Paciente = {
        nome: 'Carlos',
        documento: '12345678901',
        dataNascimento: '1990-01-01'
      };

      service.create(novoPaciente).subscribe(
        () => fail('deveria ter falhado'),
        (error) => {
          expect(error.status).toBe(409);
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.flush('Documento já existe', { status: 409, statusText: 'Conflict' });
    });
  });

  describe('getById - Obter paciente por ID', () => {
    it('deve obter um paciente específico', () => {
      const pacienteId = '123';
      const mockPaciente: Paciente = {
        id: pacienteId,
        nome: 'João Silva',
        documento: '12345678901',
        dataNascimento: '1990-01-01'
      };

      service.getById(pacienteId).subscribe(result => {
        expect(result).toEqual(mockPaciente);
      });

      const req = httpMock.expectOne(`${apiUrl}/${pacienteId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaciente);
    });

    it('deve retornar erro 404 se paciente não existe', () => {
      const pacienteId = 'inexistente';

      service.getById(pacienteId).subscribe(
        () => fail('deveria ter falhado'),
        (error) => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/${pacienteId}`);
      req.flush('Paciente não encontrado', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('update - Atualizar paciente', () => {
    it('deve atualizar um paciente com PATCH', () => {
      const pacienteId = '123';
      const updateData = {
        nome: 'João Silva Atualizado',
        documento: '12345678901',
        dataNascimento: '1990-01-01'
      };

      const mockResponse: Paciente = {
        id: pacienteId,
        ...updateData
      };

      service.update(pacienteId, updateData).subscribe(result => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${pacienteId}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });

    it('deve atualizar apenas os campos fornecidos', () => {
      const pacienteId = '123';
      const updateData = { nome: 'Novo Nome' };

      service.update(pacienteId, updateData).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${pacienteId}`);
      expect(req.request.body).toEqual(updateData);
      req.flush({});
    });
  });

  describe('deleteById - Deletar paciente', () => {
    it('deve deletar um paciente com sucesso', () => {
      const pacienteId = '123';

      service.deleteById(pacienteId).subscribe(result => {
        expect(result).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/${pacienteId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('deve retornar erro 403 ao tentar deletar paciente com exames', () => {
      const pacienteId = '123';

      service.deleteById(pacienteId).subscribe(
        () => fail('deveria ter falhado'),
        (error) => {
          expect(error.status).toBe(403);
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/${pacienteId}`);
      req.flush('Paciente possui exames', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('Signals - Estado reativo', () => {
    it('pacientes signal deve ser inicialmente um array vazio', () => {
      expect(service.pacientes()).toEqual([]);
    });

    it('page signal deve iniciar em 1', () => {
      expect(service.page()).toBe(1);
    });

    it('pageSize signal deve iniciar em 10', () => {
      expect(service.pageSize()).toBe(10);
    });

    it('isLastPage signal deve iniciar em false', () => {
      expect(service.isLastPage()).toBe(false);
    });

    it('totalPacientes signal deve iniciar em 0', () => {
      expect(service.totalPacientes()).toBe(0);
    });
  });
});
