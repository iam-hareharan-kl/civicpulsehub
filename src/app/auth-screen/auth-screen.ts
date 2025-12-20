import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './auth-screen.html',
  styleUrls: ['./auth-screen.css']
})
export class AuthScreen implements OnInit {

  isRegisterMode = false;
  successMessage = '';
  errorMessage = '';
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['CITIZEN', Validators.required]
    });
  }

  switchToRegister(): void {
    this.isRegisterMode = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  switchToLogin(): void {
    this.isRegisterMode = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  submitLogin(): void {
    if (this.loginForm.invalid) return;
    
    this.errorMessage = '';
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        if (response.token) {
          this.authService.saveToken(response.token);
        }

        if(response.role === 'CITIZEN'){this.router.navigate(['/citizen']);}
        else if (response.role === 'OFFICER'){this.router.navigate(['/officer']);}
        else{this.router.navigate(['/admin']);}
        this.cdr.detectChanges();

        // Navigate to dashboard or home page
      },
      error: (error) => {
        console.error('Login failed', error);
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  submitRegister(): void {
    if (this.registerForm.invalid) return;
    
    this.errorMessage = '';
    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        // Show success message
        if (response.role === 'CITIZEN') {this.successMessage = 'Account created successfully, You can sign in now';}
        else {this.successMessage = 'Account created successfully, Please wait for approval';}
        this.registerForm.reset({ role: 'CITIZEN' });
        this.cdr.detectChanges();
        
        // Switch to login after 2 seconds
        setTimeout(() => {
          this.switchToLogin();
        }, 2000);
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}
