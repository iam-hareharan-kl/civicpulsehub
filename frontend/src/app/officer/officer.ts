import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrievanceService } from '../service/grievance';
import { AuthService } from '../service/auth-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './officer.html',
  styleUrls: ['./officer.css'],
})
export class Officer implements OnInit {
  grievances: any[] = [];
  selectedFile: File | null = null;
  activeTab: 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' = 'ASSIGNED';

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
    this.grievanceService.getAssignedGrievances().subscribe((data) => {
      this.grievances = data;
      this.cdr.detectChanges();
    });
  }

  get filteredGrievances() {
    return this.grievances.filter(g => g.status === this.activeTab);
  }

  setActiveTab(tab: 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED') {
    this.activeTab = tab;
  }

  updateStatus(g: any, newStatus: string) {
    const message = g.tempMessage || '';

    // Validation: Check if Resolved but no file
    if (newStatus === 'RESOLVED') {
      if (!g.selectedEvidence) {
        alert("⚠️ You must upload an evidence picture before marking as Resolved!");
        return;
      }
      if (!confirm("Are you sure you want to resolve this? This action cannot be undone.")) return;
    }

    // Call Service with File
    this.grievanceService.updateStatus(g.id, newStatus, message, g.selectedEvidence).subscribe({
      next: () => {
        alert("Success! Status Updated.");
        this.loadAssignedTasks(); // Refresh list
      },
      error: (err) => {
        console.error(err);
        alert(err.error || "Failed to update status.");
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getTimeRemaining(g: any): string {
    if (!g.expectedCompletionDate) return '';
    
    const due = new Date(g.expectedCompletionDate).getTime();
    const now = new Date().getTime();
    const diffMs = due - now;

    if (diffMs < 0) return '⚠️ OVERDUE!';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m left`;
  }

  getTimeRemainingClass(g: any): string {
    if (!g.expectedCompletionDate) return '';
    const due = new Date(g.expectedCompletionDate).getTime();
    const now = new Date().getTime();
    
    if (due < now) return 'text-danger'; // Overdue (Red)
    if (due - now < 3600000 * 4) return 'text-warning'; // Less than 4 hours (Orange)
    return 'text-success'; // Safe (Green)
  }

  onFileSelected(event: any, grievance: any) {
    const file = event.target.files[0];
    if (file) {
      grievance.selectedEvidence = file; // Attach file to the specific grievance object
    }
  }
}