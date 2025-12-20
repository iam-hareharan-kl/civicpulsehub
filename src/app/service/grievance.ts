import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GrievanceService {
  private apiUrl = 'http://localhost:8080/api/grievances';

  constructor(private http: HttpClient,
  @Inject(PLATFORM_ID) private platformId: Object) {}

  private getAuthHeaders() {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || '';
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  submitGrievance(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, { headers: this.getAuthHeaders() });
  }

  getMyGrievances(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`, { headers: this.getAuthHeaders() });
  }

  getAllGrievances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`, { headers: this.getAuthHeaders() });
  }

  getOfficers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/officers`, { headers: this.getAuthHeaders() });
  }

  assignGrievance(id: number, officerId: number, priority: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}/assign`,
      { officerId, priority },
      { headers: this.getAuthHeaders() }
    );
  }

  getAssignedGrievances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assigned`, { headers: this.getAuthHeaders() });
  }

  // Officer: Update status
  updateStatus(id: number, status: string, message: string = ""): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}/status`, 
      { status, message }, 
      { headers: this.getAuthHeaders() }
    );
  }

}