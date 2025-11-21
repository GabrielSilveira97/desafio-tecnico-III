import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExamesListComponent } from './exames';
import { ExameService } from '../../services/exame.service';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

describe('ExamesListComponent', () => {
  let component: ExamesListComponent;
  let fixture: ComponentFixture<ExamesListComponent>;
  let exameService: jasmine.SpyObj<ExameService>;
  let loadingService: LoadingService;
  let notificationService: NotificationService;
  let matDialog: MatDialog;

  beforeEach(async () => {
    const exameServiceSpy = jasmine.createSpyObj('ExameService', [
      'getAll',
      'create'
    ], {
      exames: jasmine.createSpy().and.returnValue([])
    });
    
    // Set default return value for getAll
    exameServiceSpy.getAll.and.returnValue(of({ data: [], total: 0, page: 1, pageSize: 5, totalPages: 0 }));

    await TestBed.configureTestingModule({
      imports: [ExamesListComponent, HttpClientTestingModule, MatDialogModule],
      providers: [
        { provide: ExameService, useValue: exameServiceSpy },
        LoadingService,
        NotificationService
      ]
    }).compileComponents();

    exameService = TestBed.inject(ExameService) as jasmine.SpyObj<ExameService>;
    loadingService = TestBed.inject(LoadingService);
    notificationService = TestBed.inject(NotificationService);
    matDialog = TestBed.inject(MatDialog);

    fixture = TestBed.createComponent(ExamesListComponent);
    component = fixture.componentInstance;
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('deve carregar exames ao inicializar', () => {
      exameService.getAll.and.returnValue(of({ data: [], total: 0, page: 1, pageSize: 5, totalPages: 0 }));

      fixture.detectChanges();

      expect(exameService.getAll).toHaveBeenCalled();
    });
  });

  describe('carregarExames', () => {
    it('deve mostrar loading enquanto carrega', (done) => {
      exameService.getAll.and.returnValue(of({ data: [], total: 0, page: 1, pageSize: 5, totalPages: 0 } as any));
      spyOn(loadingService, 'show');
      spyOn(loadingService, 'hide');

      component.carregarExames();

      expect(loadingService.show).toHaveBeenCalled();

      setTimeout(() => {
        expect(loadingService.hide).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('deve atualizar totalExames com dados retornados', () => {
      exameService.getAll.and.returnValue(of({ 
        data: [], 
        total: 5, 
        page: 1, 
        pageSize: 5, 
        totalPages: 1 
      } as any));

      component.carregarExames();
      expect(component.totalExames()).toBe(5);
    });
  });

  describe('abrirDialogNovoExame', () => {
    it('deve abrir dialog ao clicar em Novo Exame', () => {
      spyOn(matDialog, 'open').and.returnValue({
        afterClosed: () => of(null)
      } as any);

      component.abrirDialogNovoExame();

      expect(matDialog.open).toHaveBeenCalled();
    });

    it('deve criar exame com UUID idempotencyKey', () => {
      const resultado = {
        dataExame: '2025-11-25',
        modalidade: 'CT',
        paciente: { id: 'p1', nome: 'Maria', documento: '456', dataNascimento: '1985-05-15' },
        descricao: 'Teste'
      };

      spyOn(matDialog, 'open').and.returnValue({
        afterClosed: () => of(resultado)
      } as any);

      exameService.create.and.returnValue(of({} as any));
      spyOn(notificationService, 'success');

      component.abrirDialogNovoExame();

      expect(exameService.create).toHaveBeenCalled();
      const callArgs = (exameService.create as jasmine.Spy).calls.mostRecent().args;
      expect(callArgs[0].pacienteId).toBe('p1');
      expect(callArgs[0].modalidade).toBe('CT');
      expect(callArgs[0].dataExame).toBe('2025-11-25');
    });

    it('deve usar UUID válido como idempotencyKey', () => {
      const resultado = {
        dataExame: '2025-11-25',
        modalidade: 'MR',
        paciente: { id: 'p1', nome: 'João', documento: '123', dataNascimento: '1990-01-01' },
        descricao: 'RMN'
      };

      spyOn(matDialog, 'open').and.returnValue({
        afterClosed: () => of(resultado)
      } as any);

      exameService.create.and.returnValue(of({} as any));

      component.abrirDialogNovoExame();

      const callArgs = (exameService.create as jasmine.Spy).calls.mostRecent().args;
      const idempotencyKey = callArgs[1];

      // Validar formato UUID v4
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(idempotencyKey)).toBe(true);
    });
  });

  describe('onPageChange', () => {
    it('deve atualizar pageIndex e pageSize', () => {
      const pageEvent = { pageIndex: 1, pageSize: 10 };
      exameService.getAll.and.returnValue(of({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }));

      component.onPageChange(pageEvent as any);

      expect(component.pageIndex()).toBe(1);
      expect(component.pageSize()).toBe(10);
    });
  });

  describe('dataSource computed', () => {
    it('deve paginar dados corretamente', () => {
      const mockExames = Array.from({ length: 15 }, (_, i) => ({
        id: `${i}`,
        paciente: { id: 'p1', nome: `Paciente ${i}`, documento: `${i}`, dataNascimento: '1990-01-01' },
        modalidade: 'CR' as any,
        dataExame: '2025-11-21',
        idempotencyKey: `key-${i}`
      }));

      (component as any).exames.set(mockExames);
      (component as any).pageIndex.set(0);
      (component as any).pageSize.set(5);

      const dataSource = component.dataSource();
      expect(dataSource.length).toBe(5);
      expect(dataSource[0].id).toBe('0');
    });

    it('deve retornar segunda página de dados', () => {
      const mockExames = Array.from({ length: 15 }, (_, i) => ({
        id: `${i}`,
        paciente: { id: 'p1', nome: `Paciente ${i}`, documento: `${i}`, dataNascimento: '1990-01-01' },
        modalidade: 'CR' as any,
        dataExame: '2025-11-21',
        idempotencyKey: `key-${i}`
      }));

      (component as any).exames.set(mockExames);
      (component as any).pageIndex.set(1);
      (component as any).pageSize.set(5);

      const dataSource = component.dataSource();
      expect(dataSource.length).toBe(5);
      expect(dataSource[0].id).toBe('5');
    });
  });

  describe('Título', () => {
    it('deve ter o título Exames', () => {
      expect(component.title()).toBe('Exames');
    });
  });
});
