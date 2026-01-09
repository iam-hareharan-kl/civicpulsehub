// import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { FormsModule } from '@angular/forms';
// import { ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { AuthService } from '../service/auth-service';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-auth',
//   standalone: true,
//   imports: [ReactiveFormsModule, CommonModule, FormsModule],
//   templateUrl: './auth-screen.html',
//   styleUrls: ['./auth-screen.css'],
// })
// export class AuthScreen implements OnInit {
//   isRegisterMode = false;
//   successMessage = '';
//   errorMessage = '';
//   loginForm!: FormGroup;
//   registerForm!: FormGroup;
  
  
//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private router: Router,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit(): void {
//     this.loginForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//     });

//     this.registerForm = this.fb.group({
//       fullName: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//       role: ['CITIZEN', Validators.required],
//     });
//   }

//   switchToRegister(): void {
//     this.isRegisterMode = true;
//     this.successMessage = '';
//     this.errorMessage = '';
//   }

//   switchToLogin(): void {
//     this.isRegisterMode = false;
//     this.successMessage = '';
//     this.errorMessage = '';
//   }

//   submitLogin(): void {
//     if (this.loginForm.invalid) return;

//     this.errorMessage = '';
//     this.authService.login(this.loginForm.value).subscribe({
//       next: (response) => {
//         console.log('Login successful', response);
//         if (response.token) {
//           this.authService.saveToken(response.token);
//         }

//         if (response.role === 'CITIZEN') {
//           this.router.navigate(['/citizen']);
//         } else if (response.role === 'OFFICER') {
//           this.router.navigate(['/officer']);
//         } else {
//           this.router.navigate(['/admin']);
//         }
//         this.cdr.detectChanges();

//         // Navigate to dashboard or home page
//       },
//       error: (error) => {
//         console.error('Login failed', error);
//         this.errorMessage = error.error?.message || 'Login failed. Please try again.';
//         this.cdr.detectChanges();
//       },
//     });
//   }

//   submitRegister(): void {
//     if (this.registerForm.invalid) return;

//     this.errorMessage = '';
//     this.authService.register(this.registerForm.value).subscribe({
//       next: (response) => {
//         console.log('Registration successful', response);
//         // Show success message
//         if (response.role === 'CITIZEN') {
//           this.successMessage = 'Account created successfully, You can sign in now';
//         } else {
//           this.successMessage = 'Account created successfully, Please wait for approval';
//         }
//         this.registerForm.reset({ role: 'CITIZEN' });
//         this.cdr.detectChanges();

//         // Switch to login after 2 seconds
//         setTimeout(() => {
//           this.switchToLogin();
//         }, 2000);
//       },
//       error: (error) => {
//         console.error('Registration failed', error);
//         this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
//         this.cdr.detectChanges();
//       },
//     });
//   }
// }

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './auth-screen.html',
  styleUrls: ['./auth-screen.css'],
})
export class AuthScreen implements OnInit {
  // View State: 'LOGIN' | 'REGISTER' | 'FORGOT'
  viewState: string = 'LOGIN';
  
  successMessage = '';
  errorMessage = '';
  
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  forgotPasswordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['CITIZEN', Validators.required],
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // --- Navigation Switches ---
  switchToRegister(): void {
    this.viewState = 'REGISTER';
    this.clearMessages();
  }

  switchToLogin(): void {
    this.viewState = 'LOGIN';
    this.clearMessages();
  }

  switchToForgotPassword(): void {
    this.viewState = 'FORGOT';
    this.clearMessages();
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  // --- Form Submissions ---

  submitLogin(): void {
    if (this.loginForm.invalid) return;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.token) {
          this.authService.saveToken(response.token);
        }
        if (response.role === 'CITIZEN') {
          this.router.navigate(['/citizen']);
        } else if (response.role === 'OFFICER') {
          this.router.navigate(['/officer']);
        } else {
          this.router.navigate(['/admin']);
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Login failed.';
        this.cdr.detectChanges();
      },
    });
  }

  submitRegister(): void {
    if (this.registerForm.invalid) return;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.successMessage = response.role === 'CITIZEN' 
          ? 'Account created successfully. You can sign in now.' 
          : 'Account created. Please wait for approval.';
        
        this.registerForm.reset({ role: 'CITIZEN' });
        this.cdr.detectChanges();
        setTimeout(() => this.switchToLogin(), 2000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Registration failed.';
        this.cdr.detectChanges();
      },
    });
  }

  submitForgotPassword(): void {
    if (this.forgotPasswordForm.invalid) return;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.forgotPasswordForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'If an account exists, a reset link has been sent.';
        this.forgotPasswordForm.reset();
        this.cdr.detectChanges();
      },
      error: (error) => {
        // Even on error, we often show the same message for security, 
        // but here we display the error for debugging if needed.
        this.errorMessage = 'Unable to process request. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}
