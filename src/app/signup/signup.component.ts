import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';
  showSuccessMessage: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(private formBuilder: FormBuilder, 
    private router: Router,
    private authService: AuthService
  ) {
    this.signupForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator()]],
    });
  }

  passwordValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasLetter = /[a-zA-Z]/.test(value);
      const hasNumber = /[0-9]/.test(value);

      if (!hasLetter || !hasNumber) {
        return { passwordRequirements: true };
      }

      return null;
    };
  }

  

  hasMinLength(): boolean {
    const password = this.signupForm.get('password')?.value;
    return password?.length >= 8;
  }

  hasLetter(): boolean {
    const password = this.signupForm.get('password')?.value;
    return /[a-zA-Z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.signupForm.get('password')?.value;
    return /[0-9]/.test(password);
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.authService.register(this.signupForm.value).subscribe((res: any) => {
        console.log(res);
        this.isLoading = false;
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      }, (err: any) => {
        this.errorMessage = err.error.message;
        this.isLoading = false;
      });
    } else {
      this.errorMessage = 'Invalid form data';
    }
  }
  onLogin() {
    this.router.navigate(['/login']);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}