import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ExameService } from '../../services/exame.service';
import { Exame, CreateExameRequest } from '../../../../core/models/medical.model';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { formatarData } from '../../../../../utils/dateFunction';
import { MatButtonModule } from '@angular/material/button';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ExameCreateDialog } from '../dialog/dialog';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { v4 as uuidv4 } from 'uuid';



@Component({
  selector: 'app-exames',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, CdkTableModule, MatPaginatorModule, MatIconModule],
  templateUrl: './exames.html',
  styleUrl: './exames.css',
})
export class ExamesListComponent implements OnInit {

  private examesService = inject(ExameService);
  private dialog = inject(MatDialog);
  private loadingService = inject(LoadingService);
  private notificationService = inject(NotificationService);

    title = signal('Exames')

    formatarData = formatarData

    exames = signal<Exame[]>([])
    pageIndex = signal(0);
    pageSize = signal(5);
    totalExames = signal(0);
    pageSizeOptions = [5, 10, 15, 20];
    
    loading$ = this.loadingService.loading$

    ngOnInit(){
      this.carregarExames()
    }

    carregarExames(){
      this.loadingService.show();
      this.examesService.getAll().subscribe({
        next: (res) => {
          this.exames.set(res.data);
          this.totalExames.set(res.data.length);
          this.loadingService.hide();
        },
        error: (err) => {
          this.loadingService.hide();
          this.notificationService.error('Erro ao carregar exames. Tente novamente.');
          console.error('Erro ao carregar exames:', err);
        }
      });
    }

    onPageChange(event: PageEvent) {
      this.pageIndex.set(event.pageIndex);
      this.pageSize.set(event.pageSize);
    }

    displayedColumns = ['data', 'idUnique', 'modalidade', 'paciente', 'descricao']
    dataSource = computed(() => {
      const inicio = this.pageIndex() * this.pageSize();
      const fim = inicio + this.pageSize();
      return this.exames().slice(inicio, fim);
    })

    
    abrirDialogNovoExame() {
        const ref = this.dialog.open(ExameCreateDialog, {
          width: '450px'
        });

        ref.afterClosed().subscribe((resultado) => {
          if (resultado) {
            this.loadingService.show();
            
            const novoExame: CreateExameRequest = {
              dataExame: resultado.dataExame,
              modalidade: resultado.modalidade,
              pacienteId: resultado.paciente.id,
              descricao: resultado.descricao,
              idempotencyKey: uuidv4()
            };

            this.examesService.create(novoExame, novoExame.idempotencyKey).subscribe({
              next: () => {
                this.loadingService.hide();
                this.notificationService.success('Exame criado com sucesso!');
                this.carregarExames();
              },
              error: (err) => {
                this.loadingService.hide();
                const mensagem = err.error?.message || 'Erro ao criar exame. Tente novamente.';
                this.notificationService.error(mensagem);
                console.error('Erro ao criar exame:', err);
              }
            });
          }
        });
    }

}
