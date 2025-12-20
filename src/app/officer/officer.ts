import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrievanceService } from '../service/grievance';
import { AuthService } from '../service/auth-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule],
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

  updateStatus(g: any, newStatus: string) {
    const message = g.tempMessage || ''; // Get typed message
    
    if (newStatus === 'RESOLVED' && !message) {
        if(!confirm("Resolve without a note?")) return;
    }

    this.grievanceService.updateStatus(g.id, newStatus, message).subscribe({
      next: () => {
        alert("Updated Successfully!");
        this.loadAssignedTasks();
      },
      error: () => alert("Failed to update.")
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}