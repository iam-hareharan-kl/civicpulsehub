import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GrievanceService } from '../service/grievance';
import { AuthService } from '../service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './citizen.html',
  styleUrls: ['./citizen.css']
})
export class Citizen implements OnInit {
  grievanceForm!: FormGroup;
  selectedFile: File | null = null;
  
  stats = { total: 0, solved: 0, pending: 0 };
  grievances: any[] = [];
  successMessage = '';

  constructor(private fb: FormBuilder, private grievanceService: GrievanceService, private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.grievanceForm = this.fb.group({
      department: ['Roads', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required]
    });
  }

  loadData() {
    this.grievanceService.getStats().subscribe(data => this.stats = data);
    this.grievanceService.getMyGrievances().subscribe(data => this.grievances = data);

    this.grievanceService.getMyGrievances().subscribe(data => {
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
      alert("Geolocation is not supported by this browser.");
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
      error: (err) => console.error(err)
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']); // Redirect to Auth Screen
  }
}