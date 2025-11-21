import { Component, signal, computed } from '@angular/core';
import { PacienteService } from '../../services/paciente.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { formatarData } from '../../../../../utils/dateFunction';
import { MatDialog } from '@angular/material/dialog';
import { PacienteCreateDialog } from '../dialog-form/dialog';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [MatTableModule, MatButtonModule],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css',
})
export class PacientesListComponent {

  constructor(
    public pacienteService: PacienteService,
    private dialog: MatDialog
  ) {}

  title = signal('Pacientes');
  formatarData = formatarData;

  dataSource = computed(() => this.pacienteService.pacientes());

  displayedColumns = ['nome', 'documento', 'dataNascimento'];

  ngOnInit() {
    this.pacienteService.load();
  }

abrirDialogNovoPaciente() {
  const ref = this.dialog.open(PacienteCreateDialog, {
    width: '450px'
  });

  ref.afterClosed().subscribe(data => {
    if (!data) return;

    this.pacienteService.create(data).subscribe({
      next: (novo) => {
        this.pacienteService.pacientes.update(list => [...list, novo]);
      },
      error: (err) => {
        if (err.status === 409) {
          alert('Já existe um paciente com esse documento.');
        }
        if(err.status === 400){
          alert('documento precisa ser igual ou maior que 5 digitos')
        }
        else {
          alert('Erro ao criar paciente.');
        }
      }
    });
  });
}
}
