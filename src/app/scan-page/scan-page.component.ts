import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
export class ScanPageComponent {
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isProcessing: boolean = false;
  ocrData: OCRData | null = null;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private imageService: ImageService) {}

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      this.errorMessage = '';
      this.successMessage = '';
      this.ocrData = null;

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
          this.successMessage = 'Image processed successfully!';
        }
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
