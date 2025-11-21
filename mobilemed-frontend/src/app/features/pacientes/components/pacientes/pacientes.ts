import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { PacienteService } from '../../services/paciente.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { formatarData } from '../../../../../utils/dateFunction';
import { MatDialog } from '@angular/material/dialog';
import { PacienteCreateDialog } from '../dialog-form/dialog';
import { MatIconModule } from '@angular/material/icon';
import { LoadingService } from '../../../../../app/core/services/loading/loading.service';
import { NotificationService } from '../../../../../app/core/services/notification/notification.service';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatPaginatorModule],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css',
})
export class PacientesListComponent implements OnInit {

  private pacienteService = inject(PacienteService);
  private dialog = inject(MatDialog);
  private loadingService = inject(LoadingService);
  private notificationService = inject(NotificationService);

  title = signal('Pacientes');
  formatarData = formatarData;
  pageSizeOptions = [5, 10, 15, 20];

  dataSource = computed(() => this.pacienteService.pacientes());
  page = computed(() => this.pacienteService.page());
  pageSize = computed(() => this.pacienteService.pageSize());
  totalPacientes = computed(() => this.pacienteService.totalPacientes());
  isLastPage = computed(() => this.pacienteService.isLastPage());
  loading$ = this.loadingService.loading$;

  displayedColumns = ['nome', 'documento', 'dataNascimento', 'acoes'];

  ngOnInit() {
    this.carregarPacientes();
  }

  carregarPacientes(page: number = 1, pageSize: number = 5) {
    this.loadingService.show();
    this.pacienteService.load(page, pageSize);
    setTimeout(() => this.loadingService.hide(), 300);
  }

  onPageChange(event: PageEvent) {
    this.carregarPacientes(event.pageIndex + 1, event.pageSize);
  }

  abrirDialogNovoPaciente() {
    const ref = this.dialog.open(PacienteCreateDialog, {
      width: '450px'
    });

    ref.afterClosed().subscribe(data => {
      if (!data) return;

      this.loadingService.show();
      this.pacienteService.create(data).subscribe({
        next: () => {
          this.loadingService.hide();
          this.notificationService.success('Paciente criado com sucesso!');
          this.carregarPacientes();
        },
        error: (err) => {
          this.loadingService.hide();
          const mensagem = this.obterMensagemErro(err);
          this.notificationService.error(mensagem);
        }
      });
    });
  }

  editarPaciente(id: string) {
    this.loadingService.show();
    this.pacienteService.getById(id).subscribe({
      next: (paciente) => {
        this.loadingService.hide();
        const ref = this.dialog.open(PacienteCreateDialog, {
          width: '450px',
          data: { paciente, isEditing: true }
        });

        ref.afterClosed().subscribe(data => {
          if (!data) return;

          this.loadingService.show();
          
          // Garantir que a data está no formato correto
          const updateData = {
            nome: data.nome,
            documento: data.documento,
            dataNascimento: typeof data.dataNascimento === 'string' 
              ? data.dataNascimento 
              : new Date(data.dataNascimento).toISOString().split('T')[0]
          };

          this.pacienteService.update(id, updateData).subscribe({
            next: () => {
              this.loadingService.hide();
              this.notificationService.success('Paciente atualizado com sucesso!');
              this.carregarPacientes(this.page());
            },
            error: (err) => {
              this.loadingService.hide();
              const mensagem = this.obterMensagemErro(err);
              this.notificationService.error(mensagem);
            }
          });
        });
      },
      error: (err) => {
        this.loadingService.hide();
        this.notificationService.error('Erro ao carregar paciente para edição');
      }
    });
  }

  excluirPaciente(id: string) {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) return;

    this.loadingService.show();
    this.pacienteService.deleteById(id).subscribe({
      next: () => {
        this.loadingService.hide();
        this.notificationService.success('Paciente excluído com sucesso!');
        this.carregarPacientes(this.page());
      },
      error: (err) => {
        this.loadingService.hide();
        const mensagem = this.obterMensagemErro(err);
        this.notificationService.error(mensagem);
      }
    });
  }

  private obterMensagemErro(err: any): string {
    if (err.error?.message) {
      return err.error.message;
    }

    switch (err.status) {
      case 400:
        return 'Dados inválidos. Verifique os campos.';
      case 403:
        return 'Não é possível excluir paciente com exames cadastrados.';
      case 404:
        return 'Paciente não encontrado.';
      case 409:
        return 'Já existe um paciente com esse documento.';
      case 500:
        return 'Erro do servidor. Tente novamente mais tarde.';
      default:
        return 'Erro ao processar operação. Tente novamente.';
    }
  }
}
