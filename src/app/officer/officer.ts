import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrievanceService } from '../service/grievance';
import { AuthService } from '../service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './officer.html',
  styleUrls: ['./officer.css']
})
export class Officer implements OnInit {
  grievances: any[] = [];

  constructor(
    private grievanceService: GrievanceService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAssignedTasks();
  }

  loadAssignedTasks() {
    this.grievanceService.getAssignedGrievances().subscribe(data => {
      this.grievances = data;
      this.cdr.detectChanges();
    });
  }

  updateStatus(id: number, newStatus: string) {
    if (!confirm(`Are you sure you want to mark this as ${newStatus}?`)) return;

    this.grievanceService.updateStatus(id, newStatus).subscribe({
      next: () => {
        alert("Status Updated!");
        this.loadAssignedTasks(); // Refresh list
      },
      error: () => alert("Failed to update status")
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}