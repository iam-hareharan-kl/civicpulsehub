import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'; // Import catchError
import { Router } from '@angular/router'; // Import Router
@Injectable({
  providedIn: 'root',
})
export class GrievanceService {
  private apiUrl = 'http://localhost:8080/api/grievances';

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object, private router: Router) {}

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

  updateStatus(id: number, status: string, message: string = '', file: File | null = null): Observable<any> {
    const formData = new FormData();
    formData.append('status', status);
    if (message) formData.append('message', message);
    if (file) formData.append('file', file);

    return this.http.put(
      `${this.apiUrl}/${id}/status`, 
      formData, 
      { headers: this.getAuthHeaders() } // Do NOT set Content-Type to JSON manually
    );
  }

  submitFeedback(id: number, feedback: string, rating: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}/feedback`,
      { feedback, rating },
      { headers: this.getAuthHeaders() }
    );
  }

  notifyCitizen(id: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}/notify`, 
      {}, 
      { headers: this.getAuthHeaders() }
    );
  }

  // ... inside GrievanceService ...

  reopenGrievance(id: number, reason: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}/reopen`, 
      { reason }, 
      { headers: this.getAuthHeaders() }
    );
  }
  private handleError(error: HttpErrorResponse) {
    if (error.status === 403) {
      // Token is invalid/expired -> Force Logout
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        // Redirect to login
        this.router.navigate(['/']); 
      }
    }
    return throwError(() => error);
  }

  getMyGrievances(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(catchError(err => this.handleError(err)));
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`, { headers: this.getAuthHeaders() })
      .pipe(catchError(err => this.handleError(err)));
  }
}
