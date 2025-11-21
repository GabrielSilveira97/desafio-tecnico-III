import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviroments/enviroment';
import { Paciente, PaginatedResponse } from '../../../core/models/medical.model';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/pacientes`;

  pacientes = signal<Paciente[]>([]);
  page = signal(1);
  pageSize = signal(10);
  totalPacientes = signal(0);
  isLastPage = signal(false);

  load(page: number = 1, pageSize: number = 5): void {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    this.http.get<PaginatedResponse<Paciente>>(this.API_URL, { params })
      .subscribe(res => {

      if (res.data.length === 0 && page > 1) {
        this.isLastPage.set(true);
        return;
      }

        this.pacientes.set(res.data);

        this.page.set(res.page);
        this.pageSize.set(res.pageSize);
        this.totalPacientes.set(res.total);

        this.isLastPage.set(res.data.length === 0);
      });
  }

  create(paciente: Paciente): Observable<Paciente> {
    return this.http.post<Paciente>(this.API_URL, paciente);
  }

  getById(id: string): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.API_URL}/${id}`);
  }

  update(id: string, paciente: Partial<Paciente>): Observable<Paciente> {
    return this.http.patch<Paciente>(`${this.API_URL}/${id}`, paciente);
  }

  deleteById(id: string): Observable<Paciente> {
    return this.http.delete<Paciente>(`${this.API_URL}/${id}`);
  }
}
