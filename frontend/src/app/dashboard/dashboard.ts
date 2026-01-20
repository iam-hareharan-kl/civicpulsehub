import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrievanceService } from '../service/grievance';
import { AuthService } from '../service/auth-service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Admin implements OnInit {
  grievances: any[] = [];
  officers: any[] = [];
  pendingOfficers: any[] = [];
  slaConfigs: any[] = [];
  isBrowser: boolean;
  showAnalytics: boolean = false;

  public pieChartOptions: ChartOptions<'pie'> = { responsive: true };
  public pieChartLabels = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
  public pieChartDatasets = [{ data: [0, 0, 0, 0], backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'] }];

  // 2. Department Chart (Bar)
  public deptChartOptions: ChartOptions<'bar'> = { responsive: true, plugins: { legend: { display: false } } };
  public deptChartLabels: string[] = [];
  public deptChartDatasets = [{ data: [] as number[], label: 'Tickets', backgroundColor: '#8b5cf6' }];

  // 3. Zone/Location Chart (Bar) - Identifies "Red Zones"
  public zoneChartOptions: ChartOptions<'bar'> = { responsive: true, indexAxis: 'y' }; // Horizontal Bar
  public zoneChartLabels: string[] = [];
  public zoneChartDatasets = [{ data: [] as number[], label: 'Complaints', backgroundColor: '#ef4444' }];

  // 4. SLA Chart (Doughnut)
  public slaChartOptions: ChartOptions<'doughnut'> = { responsive: true };
  public slaChartLabels = ['SLA Met', 'SLA Breached'];
  public slaChartDatasets = [{ data: [0, 0], backgroundColor: ['#10b981', '#ef4444'] }];

  activeTab: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'REOPENED' = 'PENDING';
  filterDate: string = '';
  filterDept: string = '';

  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private grievanceService: GrievanceService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object // 3. Inject Platform ID
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
        this.loadData();
        this.cdr.detectChanges();
        this.loadPendingOfficers();
        this.loadSLAConfigs();
        // this.loadDashboardAnalytics();
    }
  }

  get filteredGrievances() {
    return this.grievances.filter(g => {
      if (g.status !== this.activeTab) return false;
      if (this.filterDept && g.department !== this.filterDept) return false;
      if (this.filterDate) {
        const gDate = new Date(g.createdAt).toISOString().split('T')[0];
        if (gDate !== this.filterDate) return false;
      }
      return true;
    });
  }

  setActiveTab(tab: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'REOPENED') {
    this.activeTab = tab;
  }

  clearFilters() {
    this.filterDate = '';
    this.filterDept = '';
  }

  loadDashboardAnalytics() {
    if (isPlatformBrowser(this.platformId)) {
      this.http.get<any>(`${this.apiUrl}/admin/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).subscribe(data => {
        // 1. Status
        const status = data.status || {};
        this.pieChartDatasets = [{
          data: [status['PENDING']||0, status['IN_PROGRESS']||0, status['RESOLVED']||0, status['REJECTED']||0],
          backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']
        }];

        // 2. Department
        const dept = data.department || {};
        this.deptChartLabels = Object.keys(dept);
        this.deptChartDatasets = [{ data: Object.values(dept), label: 'Tickets', backgroundColor: '#8b5cf6' }];

        // 3. Zone (Sorted to show Red Zones first)
        const zone = data.zone || {};
        const sortedZones = Object.entries(zone).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5); // Top 5
        this.zoneChartLabels = sortedZones.map(z => z[0]);
        this.zoneChartDatasets = [{ data: sortedZones.map(z => z[1] as number), label: 'Complaints', backgroundColor: '#ef4444' }];

        // 4. SLA
        const sla = data.sla || {};
        this.slaChartDatasets = [{ data: [sla['Met']||0, sla['Breached']||0], backgroundColor: ['#10b981', '#ef4444'] }];

        this.cdr.detectChanges();
      });
    }
  }

  loadPendingOfficers() {
    // 5. Check Platform before using localStorage
    if (isPlatformBrowser(this.platformId)) {
        this.http.get<any[]>(`${this.apiUrl}/admin/officers/pending`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).subscribe(data => {
            this.pendingOfficers = data.map(officer => ({
                ...officer,
                selectedDept: officer.selectedDept || ''
            }));
            this.cdr.detectChanges();
        });
    }
  }

  getOfficersByDept(department: string): any[] {
    if (!department) return [];
    return this.officers.filter(off => off.department === department);
  }

  approveOfficer(officer: any) {
    if (!officer.selectedDept) {
      alert("Please assign a department first.");
      return;
    }

    // 6. Check Platform here too
    if (isPlatformBrowser(this.platformId)) {
        this.http.put(`${this.apiUrl}/admin/officers/${officer.id}/approve`,
        { department: officer.selectedDept },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        ).subscribe({
            next: () => {
                alert("Officer Approved!");
                this.loadPendingOfficers();
            },
            error: (err) => {
                console.error("Approval Failed:", err);
                alert("Failed to approve officer. Error: " + (err.error?.message || err.status));
            }
        });
    }
  }

  loadData() {
    if (isPlatformBrowser(this.platformId)) {
        this.grievanceService.getAllGrievances().subscribe(data => {
            this.grievances = data;
            this.cdr.detectChanges();
        });

        this.grievanceService.getOfficers().subscribe(data => {
            this.officers = data;
            this.cdr.detectChanges();
        });
    }
  }

  assign(g: any) {
    if (!g.selectedOfficerId || !g.selectedPriority) {
      alert("Please select both an Officer and a Priority");
      return;
    }
    this.grievanceService.assignGrievance(g.id, g.selectedOfficerId, g.selectedPriority).subscribe({
      next: () => {
        alert("Grievance Assigned Successfully!");
        this.loadData();
      },
      error: () => alert("Failed to assign.")
    });
  }

  reject(g: any) {
    const reason = prompt("Please enter a reason for rejection:");
    if (!reason) return;

    this.grievanceService.updateStatus(g.id, 'REJECTED', reason).subscribe({
      next: () => {
        alert("Grievance Rejected.");
        this.loadData();
      },
      error: () => alert("Failed to reject grievance.")
    });
  }

  notify(g: any) {
    if(!confirm("Notify citizen about this status update?")) return;

    this.grievanceService.notifyCitizen(g.id).subscribe({
      next: () => {
        g.notified = true;
        this.cdr.detectChanges();
      },
      error: () => alert("Failed to notify citizen.")
    });
  }

  loadSLAConfigs() {
    if (isPlatformBrowser(this.platformId)) {
        this.http.get<any[]>('http://localhost:8080/api/sla', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).subscribe(data => {
            if(data.length === 0) {
                this.http.post('http://localhost:8080/api/sla/init', {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }).subscribe(() => this.loadSLAConfigs());
            } else {
                this.slaConfigs = data;
                this.cdr.detectChanges();
            }
        });
    }
  }

  updateSLA(sla: any) {
     if (isPlatformBrowser(this.platformId)) {
        this.http.put('http://localhost:8080/api/sla', sla, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).subscribe(() => alert(`Updated SLA for ${sla.priority}`));
     }
  }

  isOverdue(g: any): boolean {
    if (!g.expectedCompletionDate || g.status === 'RESOLVED') return false;
    return new Date(g.expectedCompletionDate) < new Date();
  }

  wasResolvedOnTime(g: any): boolean {
    if (!g.expectedCompletionDate || !g.resolvedAt) return true;
    return new Date(g.resolvedAt) <= new Date(g.expectedCompletionDate);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleAnalytics() {
    this.showAnalytics = !this.showAnalytics;

    // Only load data if showing and not already populated (optional check, or refresh every time)
    if (this.showAnalytics) {
      this.loadDashboardAnalytics();
    }
  }
}
