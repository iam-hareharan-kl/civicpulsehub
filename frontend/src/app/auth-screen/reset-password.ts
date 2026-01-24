import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../service/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="reset-container">
      <div class="reset-box">
        <h2>Reset Password</h2>
        
        <div *ngIf="message" [class.success]="isSuccess" [class.error]="!isSuccess" class="alert">
          {{ message }}
        </div>

        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" *ngIf="!isSuccess">
          <label>New Password</label>
          <input type="password" formControlName="password" placeholder="Enter new password" />
          
          <button type="submit" [disabled]="resetForm.invalid">Update Password</button>
        </form>

        <a *ngIf="isSuccess" (click)="goToLogin()">Back to Login</a>
      </div>
    </div>
  `,
  styles: [`
    .reset-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f1f5f9; font-family: 'Inter', sans-serif; }
    .reset-box { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
    h2 { margin-top: 0; color: #1e293b; }
    input { width: 100%; padding: 12px; margin: 10px 0 20px; border: 2px solid #e2e8f0; border-radius: 8px; box-sizing: border-box; }
    button { width: 100%; padding: 12px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    button:disabled { background: #94a3b8; cursor: not-allowed; }
    a { display: block; text-align: center; margin-top: 20px; color: #4f46e5; cursor: pointer; text-decoration: underline; }
    .alert { padding: 10px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
    .success { background: #ecfdf5; color: #065f46; }
    .error { background: #fef2f2; color: #991b1b; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token = '';
  message = '';
  isSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.message = 'Invalid or missing reset token.';
        this.resetForm.disable();
      }
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid) return;

    this.authService.resetPassword(this.token, this.resetForm.value.password).subscribe({
      next: (res) => {
        this.isSuccess = true;
        this.message = res.message;
      },
      error: (err) => {
        this.isSuccess = false;
        this.message = err.error?.message || 'Failed to reset password.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/']);
  }
}