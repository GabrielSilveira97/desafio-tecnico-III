import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../enviroments/enviroment';
import { Paciente, PaginatedResponse } from '../../../core/models/medical.model';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/pacientes`;

  pacientes = signal<Paciente[]>([]);

  load(page: number = 1, limit: number = 10): void {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    this.http.get<PaginatedResponse<Paciente>>(this.API_URL, { params })
      .subscribe(res => this.pacientes.set(res.data));
  }

  create(paciente: Paciente): Observable<Paciente> {
    return this.http.post<Paciente>(this.API_URL, paciente)
      .pipe(
        tap(novo => {
          this.pacientes.update(list => [...list, novo]);
        })
      );
  }

  getById(id: string): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.API_URL}/${id}`);
  }
}
