import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrievanceService } from '../service/grievance';
import { AuthService } from '../service/auth-service';
import { Router } from '@angular/router';

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

  constructor(
    private grievanceService: GrievanceService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
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