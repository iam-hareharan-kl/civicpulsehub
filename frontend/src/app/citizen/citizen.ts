import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GrievanceService } from '../service/grievance';
import { AuthService } from '../service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './citizen.html',
  styleUrls: ['./citizen.css'],
})
export class Citizen implements OnInit {
  grievanceForm!: FormGroup;
  selectedFile: File | null = null;

  stats = { total: 0, solved: 0, pending: 0 };
  grievances: any[] = [];
  successMessage = '';
  showFeedbackModal = false;
  selectedGrievanceId: number | null = null;
  feedbackText = '';
  feedbackRating = 5;

  constructor(
    private fb: FormBuilder,
    private grievanceService: GrievanceService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
        this.initForm();
        this.loadData();
    }
  }

  initForm() {
    this.grievanceForm = this.fb.group({
      department: ['Roads', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
    });
  }

  loadData() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.grievanceService.getStats().subscribe((data) => (this.stats = data));
    this.grievanceService.getMyGrievances().subscribe((data) => (this.grievances = data));

    this.grievanceService.getMyGrievances().subscribe((data) => {
      this.grievances = data;
      this.cdr.detectChanges();
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // Feature: Auto-detect location
  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords = `${position.coords.latitude}, ${position.coords.longitude}`;
        this.grievanceForm.patchValue({ location: coords });
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  onSubmit() {
    if (this.grievanceForm.invalid) return;

    const formData = new FormData();
    formData.append('department', this.grievanceForm.get('department')?.value);
    formData.append('description', this.grievanceForm.get('description')?.value);
    formData.append('location', this.grievanceForm.get('location')?.value);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.grievanceService.submitGrievance(formData).subscribe({
      next: () => {
        this.successMessage = 'Grievance submitted successfully!';
        this.grievanceForm.reset({ department: 'Roads' });
        this.selectedFile = null;
        this.cdr.detectChanges();
        this.loadData(); // Refresh list and stats
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => console.error(err),
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']); // Redirect to Auth Screen
  }

  openFeedbackModal(g: any) {
    this.selectedGrievanceId = g.id;
    this.feedbackText = '';
    this.feedbackRating = 5;
    this.showFeedbackModal = true;
  }

  closeFeedbackModal() {
    this.showFeedbackModal = false;
    this.selectedGrievanceId = null;
  }

  submitFeedback() {
    if (!this.selectedGrievanceId) return;

    this.grievanceService
      .submitFeedback(this.selectedGrievanceId, this.feedbackText, this.feedbackRating)
      .subscribe({
        next: () => {
          alert('Thank you for your feedback!');
          this.closeFeedbackModal();
          this.loadData(); // Refresh list to hide the button
        },
        error: () => alert('Failed to submit feedback'),
      });
  }

  reopen(g: any) {
    const reason = prompt("Please describe why you are not satisfied:");
    if (!reason) return; // User cancelled

    this.grievanceService.reopenGrievance(g.id, reason).subscribe({
      next: () => {
        alert("Grievance has been reopened. An officer will review it again.");
        this.loadData(); // Refresh list
      },
      error: () => alert("Failed to reopen grievance.")
    });
  }
}
