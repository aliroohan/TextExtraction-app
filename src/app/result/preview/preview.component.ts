import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-preview',
  imports: [PdfViewerModule, CommonModule],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss'
})
export class PreviewComponent {
  @Input() imagePreview: string | null = null;
  @Input() pdfUrl: string | null = null;
  @Input() isPdfFile: boolean = false;
  @Input() fileName: string = '';
  workerSrc = 'assets/pdf.worker.js';
  pdfUrlString: string = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    // Set the worker source
    console.log(this.pdfUrl);
    console.log(this.imagePreview); 
    this.workerSrc = 'assets/pdf.worker.js';
    if(this.isPdfFile){
      this.pdfUrl = 'data:application/pdf;base64,' + this.pdfUrl;
    } else {
      this.imagePreview = 'data:image/jpeg;base64,' + this.imagePreview;
    }
  }

  ngOnChanges() {
    
  }

  onPdfLoadComplete(event: any) {
    console.log('PDF loaded successfully:', event);
  }

  onPdfError(error: any) {
    console.error('PDF loading error:', error);
  }
}
