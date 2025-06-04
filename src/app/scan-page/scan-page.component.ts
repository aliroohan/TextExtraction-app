import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ImageService } from '../Services/image.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  pdfUrl: SafeResourceUrl | null = null;
  isPdfFile: boolean = false;
  isProcessing: boolean = false;
  ocrData: OCRData | null = null;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private imageService: ImageService,
    private router: Router,
    private sanitizer: DomSanitizer
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
      this.pdfUrl = null;

      // Check if the file is a PDF
      this.isPdfFile = file.type === 'application/pdf';

      if (this.isPdfFile) {
        // Create PDF preview
        const pdfBlobUrl = URL.createObjectURL(file);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfBlobUrl);
      } else {
        // Create image preview
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  processImage(): void {
    if (!this.selectedImage) {
      this.errorMessage = 'Please select an image or PDF first';
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
          
          // Handle annotated file from backend
          if (response.body.annotated_file_base64) {
            // Check if the original file was a PDF
            if (this.isPdfFile) {
              // Handle annotated PDF from backend
              const pdfBlob = this.base64ToBlob(response.body.annotated_file_base64, 'application/pdf');
              const pdfBlobUrl = URL.createObjectURL(pdfBlob);
              this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfBlobUrl);
              this.imagePreview = null;
            } else {
              // Handle annotated image from backend
              this.imagePreview = 'data:image/jpeg;base64,' + response.body.annotated_file_base64;
              this.pdfUrl = null;
            }
          }
          
          this.successMessage = `${this.isPdfFile ? 'PDF' : 'Image'} processed successfully!`;
        }
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error: HttpErrorResponse) => {
        this.isProcessing = false;
        this.errorMessage = 'Error processing file: ' + (error.error?.message || error.message);
      }
    });
  }

  clearData(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    this.pdfUrl = null;
    this.isPdfFile = false;
    this.ocrData = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.isProcessing = false;
  }

  private base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
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
