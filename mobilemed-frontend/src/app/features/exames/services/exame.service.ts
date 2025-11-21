import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviroments/enviroment';
import { Exame, PaginatedResponse, CreateExameRequest } from '../../../core/models/medical.model';

@Injectable({
  providedIn: 'root'
})
export class ExameService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/exames`;

  /**
   * @param exame 
   * @param idempotencyKey 
   */
  create(exame: CreateExameRequest, idempotencyKey: string): Observable<Exame> {
    const headers = new HttpHeaders({
      'Idempotency-Key': idempotencyKey
    });

    return this.http.post<Exame>(this.API_URL, exame, { headers });
  }

  getAll(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Exame>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResponse<Exame>>(this.API_URL, { params });
  }
}