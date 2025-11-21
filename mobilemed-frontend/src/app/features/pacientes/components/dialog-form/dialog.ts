import { Component, inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-paciente-create-dialog',
  templateUrl: './dialog.html',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CommonModule
  ]
})
export class PacienteCreateDialog implements OnInit {

  dialogRef = inject(MatDialogRef<PacienteCreateDialog>);
  fb = inject(FormBuilder);
  data = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    documento: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(30)]],
    dataNascimento: ['', Validators.required]
  });

  isEditing = false;
  titulo = 'Novo Paciente';

  ngOnInit() {
    if (this.data?.isEditing && this.data?.paciente) {
      this.isEditing = true;
      this.titulo = 'Editar Paciente';
      
      const paciente = this.data.paciente;
      this.form.patchValue({
        nome: paciente.nome,
        documento: paciente.documento,
        dataNascimento: typeof paciente.dataNascimento === 'string' 
          ? paciente.dataNascimento.split('T')[0]
          : paciente.dataNascimento
      });
    }
  }

  salvar() {
    if (this.form.invalid) return;
    
    this.dialogRef.close(this.form.value); 
  }

  fechar() {
    this.dialogRef.close(null);
  }

  obterMensagemErro(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return `${fieldName} é obrigatório`;
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `${fieldName} deve ter no mínimo ${minLength} caracteres`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.getError('maxlength').requiredLength;
      return `${fieldName} deve ter no máximo ${maxLength} caracteres`;
    }
    return 'Campo inválido';
  }
}

export { PacienteCreateDialog as Dialog };
