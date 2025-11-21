import { Component, computed, inject, signal } from '@angular/core';
import { ExameService } from '../../services/exame.service';
import { Exame } from '../../../../core/models/medical.model';
import { MatTableModule } from '@angular/material/table';
import { formatarData } from '../../../../../utils/dateFunction';
import { MatButtonModule } from '@angular/material/button';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-exames',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, CdkTableModule],
  templateUrl: './exames.html',
  styleUrl: './exames.css',
})
export class ExamesListComponent {

  constructor (private examesService : ExameService){}


    title = signal('Exames')

    formatarData = formatarData

    exames = signal<Exame[]>([])

    ngOnInit(){
      this.carregarExames()
    }

    carregarExames(){
      this.examesService.getAll().subscribe((res) => {
        this.exames.set(res.data)
      })
      
    }

    displayedColumns = ['data', 'idUnique', 'modalidade', 'paciente', 'descricao']
    dataSource = computed(() => this.exames())

}
