import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrievanceService } from '../service/grievance';
import { AuthService } from '../service/auth-service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Admin implements OnInit {
  grievances: any[] = [];
  officers: any[] = [];
  pendingOfficers: any[] = [];
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private grievanceService: GrievanceService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadData();
    this.loadPendingOfficers();
  }

  loadPendingOfficers() {
    this.http.get<any[]>(`${this.apiUrl}/admin/officers/pending`, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
    }).subscribe(data => {
      this.pendingOfficers = data;
    });
  }

  getOfficersByDept(department: string): any[] {
    if (!department) return [];
    return this.officers.filter(off => off.department === department);
  }

  // Approve function
  approveOfficer(officer: any) {
    if (!officer.selectedDept) {
      alert("Please assign a department first.");
      return;
    }

    this.http.put(`${this.apiUrl}/admin/officers/${officer.id}/approve`, 
      { department: officer.selectedDept },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    ).subscribe(() => {
      alert("Officer Approved!");
      this.loadPendingOfficers(); // Refresh list
    });
  }

  loadData() {
    // Fetch all grievances
    this.grievanceService.getAllGrievances().subscribe(data => {
      this.grievances = data;
      this.cdr.detectChanges();
    });

    // Fetch officers for dropdown
    this.grievanceService.getOfficers().subscribe(data => {
      this.officers = data;
      this.cdr.detectChanges();
    });
  }

  assign(g: any) {
    if (!g.selectedOfficerId || !g.selectedPriority) {
      alert("Please select both an Officer and a Priority");
      return;
    }

    this.grievanceService.assignGrievance(g.id, g.selectedOfficerId, g.selectedPriority).subscribe({
      next: () => {
        alert("Grievance Assigned Successfully!");
        this.loadData(); // Refresh list
      },
      error: () => alert("Failed to assign.")
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}