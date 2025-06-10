import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ImageService } from '../../Services/image.service';
import { DataService } from '../../Services/data.service';
import { Router } from '@angular/router';
import { PdfViewerModule } from 'ng2-pdf-viewer';

export type ProcessingState = 'uploaded' | 'processing' | 'processed' | 'error';

@Component({
  selector: 'app-file-card',
  standalone: true,
  imports: [CommonModule, PdfViewerModule],
  templateUrl: './file-card.component.html',
  styleUrl: './file-card.component.scss'
})
export class FileCardComponent implements OnInit {
  @Input() file: any;
  @Output() delete = new EventEmitter<void>();

  isEditing = false;
  processingState: ProcessingState = 'uploaded';
  processingMessage = 'Uploaded';
  data: any;
  fileData: any;

  constructor(
    private imageService: ImageService,
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.data = this.file?.fileObj;
    this.fileData = this.file?.file;
    
    // Check if file is already processed
    if (this.file?.processed) {
      this.processingState = 'processed';
      this.processingMessage = 'Processed';
    } else {
      // Start processing after a short delay
      setTimeout(() => {
        this.analyzeImage();
      }, 2000);
    }
  }

  async analyzeImage() {
    if (!this.file || this.processingState === 'processing' || this.file?.processed) return;
    
    this.processingState = 'processing';
    this.processingMessage = 'Processing...';
    
    try {
      const response = await this.imageService.analyzeImage(this.fileData).toPromise();
      if (response?.body) {
        this.processingState = 'processed';
        this.processingMessage = 'Processed';
        
        // Store analysis data in the service
        this.dataService.updateFileStatus(
          this.file.fileObj.name,
          true,
          response.body
        );
        
        
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      this.processingState = 'error';
      this.processingMessage = 'Error processing';
    }
  }

  saveEdit() {
    this.isEditing = false;
    // Optionally emit an event or update the file name elsewhere
  }

  deleteFile() {
    this.delete.emit();
  }

  goToResults() {
    this.router.navigate(['/results'], { state: { file: this.file } });
  }
}
