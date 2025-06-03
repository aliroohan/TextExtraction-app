import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ImageService } from '../Services/image.service';
import { HttpErrorResponse } from '@angular/common/http';

interface OCRData {
  [key: string]: any;
}

@Component({
  selector: 'app-scan-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './scan-page.component.html',
  styleUrl: './scan-page.component.scss'
})
export class ScanPageComponent implements OnInit {
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isProcessing: boolean = false;
  ocrData: OCRData | null = null;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private imageService: ImageService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is logged in
    const token = localStorage.getItem('user');
    if (!token) {
      this.router.navigate(['/']);
    }
  }

  onSignOut() {
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      this.errorMessage = '';
      this.successMessage = '';
      this.ocrData = null;
      this.imagePreview = null;

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  processImage(): void {
    if (!this.selectedImage) {
      this.errorMessage = 'Please select an image first';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.imageService.analyzeImage(this.selectedImage).subscribe({
      next: (response: any) => {
        this.isProcessing = false;
        if (response.body) {
          this.ocrData = response.body;
          // Update image preview with the base64 image from response
          if (response.body.image_base64) {
            this.imagePreview = 'data:image/jpeg;base64,' + response.body.image_base64;
          }
          this.successMessage = 'Image processed successfully!';
        }
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error: HttpErrorResponse) => {
        this.isProcessing = false;
        this.errorMessage = 'Error processing image: ' + (error.error?.message || error.message);
      }
    });
  }

  clearData(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    this.ocrData = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.isProcessing = false;
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  formatValue(value: any): string {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }
}
