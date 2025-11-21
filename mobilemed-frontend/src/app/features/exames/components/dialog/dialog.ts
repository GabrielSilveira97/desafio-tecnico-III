import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { PacienteService } from '../../../pacientes/services/paciente.service';
import { DicomModalidade, Paciente } from '../../../../core/models/medical.model';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatIconModule
  ],
  templateUrl: './dialog.html',
  styleUrls: ['./dialog.css'],
})
export class ExameCreateDialog implements OnInit {
  dialogRef = inject(MatDialogRef<ExameCreateDialog>);
  fb = inject(FormBuilder);
  pacienteService = inject(PacienteService);

  modalidades = Object.values(DicomModalidade);

  pacientes = this.pacienteService.pacientes; 

  form!: FormGroup;

  filteredPacientes = computed(() => {
    const input = this.form?.get('paciente')?.value?.toLowerCase() || '';
    return this.pacientes().filter(p =>
      p.nome.toLowerCase().includes(input) || p.documento.includes(input)
    );
  });

  ngOnInit() {
    this.form = this.fb.group({
      dataExame: ['', Validators.required],
      modalidade: ['', Validators.required],
      paciente: ['', Validators.required],
      descricao: ['']
    });

    this.pacienteService.load(1, 100);
  }

  salvar() {
    if (this.form.invalid) return;
    
    const nomePaciente = this.form.get('paciente')?.value;
    const pacienteSelecionado = this.pacientes().find(p => p.nome === nomePaciente);
    
    if (!pacienteSelecionado) {
      alert('Paciente não encontrado');
      return;
    }

    const resultado = {
      ...this.form.value,
      paciente: pacienteSelecionado
    };
    
    this.dialogRef.close(resultado);
  }

  fechar() {
    this.dialogRef.close(null);
  }
}

export { ExameCreateDialog as Dialog };
