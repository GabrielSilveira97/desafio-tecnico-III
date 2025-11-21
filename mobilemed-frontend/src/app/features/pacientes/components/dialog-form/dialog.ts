import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-paciente-create-dialog',
  templateUrl: './dialog.html',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class PacienteCreateDialog {

  dialogRef = inject(MatDialogRef<PacienteCreateDialog>);
  fb = inject(FormBuilder);

  form = this.fb.group({
    nome: ['', Validators.required],
    documento: ['', Validators.required],
    dataNascimento: ['', Validators.required]
  });

  salvar() {
    if (this.form.invalid) return;
    
    this.dialogRef.close(this.form.value); 
  }

  fechar() {
    this.dialogRef.close(null);
  }
}
