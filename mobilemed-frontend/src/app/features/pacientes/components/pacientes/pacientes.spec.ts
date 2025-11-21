import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PacientesListComponent } from './pacientes';
import { PacienteService } from '../../services/paciente.service';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { Paciente } from '../../../../core/models/medical.model';
import { of } from 'rxjs';

describe('PacientesListComponent', () => {
  let component: PacientesListComponent;
  let fixture: ComponentFixture<PacientesListComponent>;
  let pacienteService: jasmine.SpyObj<PacienteService>;
  let loadingService: LoadingService;
  let notificationService: NotificationService;
  let matDialog: MatDialog;

  beforeEach(async () => {
    const pacienteServiceSpy = jasmine.createSpyObj('PacienteService', [
      'load',
      'create',
      'getById',
      'update',
      'deleteById'
    ], {
      pacientes: jasmine.createSpy().and.returnValue([]),
      page: jasmine.createSpy().and.returnValue(1),
      pageSize: jasmine.createSpy().and.returnValue(5),
      totalPacientes: jasmine.createSpy().and.returnValue(0),
      isLastPage: jasmine.createSpy().and.returnValue(false)
    });

    await TestBed.configureTestingModule({
      imports: [PacientesListComponent, HttpClientTestingModule, MatDialogModule],
      providers: [
        { provide: PacienteService, useValue: pacienteServiceSpy },
        LoadingService,
        NotificationService
      ]
    }).compileComponents();

    pacienteService = TestBed.inject(PacienteService) as jasmine.SpyObj<PacienteService>;
    loadingService = TestBed.inject(LoadingService);
    notificationService = TestBed.inject(NotificationService);
    matDialog = TestBed.inject(MatDialog);

    fixture = TestBed.createComponent(PacientesListComponent);
    component = fixture.componentInstance;
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('deve carregar pacientes ao inicializar', () => {
      fixture.detectChanges();
      expect(pacienteService.load).toHaveBeenCalledWith(1, 5);
    });
  });

  describe('carregarPacientes', () => {
    it('deve mostrar loading enquanto carrega', (done) => {
      spyOn(loadingService, 'show');
      spyOn(loadingService, 'hide');

      component.carregarPacientes(1, 5);

      expect(loadingService.show).toHaveBeenCalled();
      expect(pacienteService.load).toHaveBeenCalledWith(1, 5);

      setTimeout(() => {
        expect(loadingService.hide).toHaveBeenCalled();
        done();
      }, 350);
    });

    it('deve carregar com página e tamanho padrão', () => {
      component.carregarPacientes();
      expect(pacienteService.load).toHaveBeenCalledWith(1, 5);
    });
  });

  describe('abrirDialogNovoPaciente', () => {
    it('deve abrir dialog ao clicar em Novo Paciente', () => {
      spyOn(matDialog, 'open').and.returnValue({
        afterClosed: () => of(null)
      } as any);

      component.abrirDialogNovoPaciente();

      expect(matDialog.open).toHaveBeenCalled();
    });

    it('deve criar paciente após fechar dialog com dados', () => {
      const novoPaciente = {
        nome: 'João',
        documento: '123',
        dataNascimento: '1990-01-01'
      };

      spyOn(matDialog, 'open').and.returnValue({
        afterClosed: () => of(novoPaciente)
      } as any);

      pacienteService.create.and.returnValue(of({ id: '1', ...novoPaciente }));
      spyOn(notificationService, 'success');

      component.abrirDialogNovoPaciente();

      expect(pacienteService.create).toHaveBeenCalledWith(novoPaciente);
      expect(notificationService.success).toHaveBeenCalledWith('Paciente criado com sucesso!');
    });
  });

  describe('editarPaciente', () => {
    it('deve carregar paciente e abrir dialog de edição', () => {
      const pacienteId = '123';
      const paciente = {
        id: pacienteId,
        nome: 'João',
        documento: '123',
        dataNascimento: '1990-01-01'
      };

      pacienteService.getById.and.returnValue(of(paciente));
      spyOn(matDialog, 'open').and.returnValue({
        afterClosed: () => of(null)
      } as any);

      component.editarPaciente(pacienteId);

      expect(pacienteService.getById).toHaveBeenCalledWith(pacienteId);
    });

    it('deve atualizar paciente após confirmar edição', () => {
      const pacienteId = '123';
      const paciente = {
        id: pacienteId,
        nome: 'João',
        documento: '123',
        dataNascimento: '1990-01-01'
      };

      const updateData = {
        nome: 'João Atualizado',
        documento: '123',
        dataNascimento: '1990-01-01'
      };

      pacienteService.getById.and.returnValue(of(paciente));
      pacienteService.update.and.returnValue(of({ id: pacienteId, ...updateData }));
      spyOn(notificationService, 'success');
      spyOn(matDialog, 'open').and.returnValue({
        afterClosed: () => of(updateData)
      } as any);

      component.editarPaciente(pacienteId);

      expect(pacienteService.update).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalledWith('Paciente atualizado com sucesso!');
    });
  });

  describe('excluirPaciente', () => {
    it('deve confirmar antes de deletar', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.excluirPaciente('123');

      expect(pacienteService.deleteById).not.toHaveBeenCalled();
    });

    it('deve deletar paciente após confirmação', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      pacienteService.deleteById.and.returnValue(of({ id: '123', nome: 'Test', documento: 'doc', dataNascimento: '2000-01-01' } as Paciente));
      spyOn(notificationService, 'success');

      component.excluirPaciente('123');

      expect(pacienteService.deleteById).toHaveBeenCalledWith('123');
      expect(notificationService.success).toHaveBeenCalledWith('Paciente excluído com sucesso!');
    });
  });

  describe('obterMensagemErro', () => {
    it('deve retornar mensagem específica para erro 400', () => {
      const erro = { status: 400 };
      const mensagem = component['obterMensagemErro'](erro);
      expect(mensagem).toBe('Dados inválidos. Verifique os campos.');
    });

    it('deve retornar mensagem específica para erro 403', () => {
      const erro = { status: 403 };
      const mensagem = component['obterMensagemErro'](erro);
      expect(mensagem).toBe('Não é possível excluir paciente com exames cadastrados.');
    });

    it('deve retornar mensagem específica para erro 404', () => {
      const erro = { status: 404 };
      const mensagem = component['obterMensagemErro'](erro);
      expect(mensagem).toBe('Paciente não encontrado.');
    });

    it('deve retornar mensagem específica para erro 409', () => {
      const erro = { status: 409 };
      const mensagem = component['obterMensagemErro'](erro);
      expect(mensagem).toBe('Já existe um paciente com esse documento.');
    });

    it('deve retornar mensagem customizada se error.error.message existir', () => {
      const erro = { error: { message: 'Mensagem customizada' } };
      const mensagem = component['obterMensagemErro'](erro);
      expect(mensagem).toBe('Mensagem customizada');
    });
  });

  describe('Paginação', () => {
    it('deve atualizar página ao chamar onPageChange', () => {
      const pageEvent = { pageIndex: 2, pageSize: 10 };
      spyOn(component, 'carregarPacientes');

      component.onPageChange(pageEvent as any);

      expect(component.carregarPacientes).toHaveBeenCalledWith(3, 10);
    });
  });
});
