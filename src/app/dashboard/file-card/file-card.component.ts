import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../Services/data.service';
import { Router } from '@angular/router';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Subscription } from 'rxjs';

export type ProcessingState = 'uploaded' | 'processing' | 'processed' | 'error';

@Component({
  selector: 'app-file-card',
  standalone: true,
  imports: [CommonModule, PdfViewerModule],
  templateUrl: './file-card.component.html',
  styleUrl: './file-card.component.scss'
})
export class FileCardComponent implements OnInit, OnDestroy {
  @Input() file: any;
  @Output() delete = new EventEmitter<void>();

  isEditing = false;
  processingState: ProcessingState = 'uploaded';
  processingMessage = 'Uploaded';
  data: any;
  fileData: any;
  private subscription?: Subscription;

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.data = this.file?.fileObj;
    this.fileData = this.file?.file;
    
    // Subscribe to file updates to get real-time processing state
    this.subscription = this.dataService.getProcessedFiles().subscribe(files => {
      const currentFile = files.find(f => f.fileObj.name === this.data?.name);
      if (currentFile) {
        this.processingState = currentFile.processingState;
        this.updateProcessingMessage();
      }
    });

    // Set initial state
    if (this.file?.processingState) {
      this.processingState = this.file.processingState;
      this.updateProcessingMessage();
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateProcessingMessage() {
    switch (this.processingState) {
      case 'uploaded':
        this.processingMessage = 'Uploaded';
        break;
      case 'processing':
        this.processingMessage = 'Processing...';
        break;
      case 'processed':
        this.processingMessage = 'Processed';
        break;
      case 'error':
        this.processingMessage = 'Error processing';
        break;
    }
  }

  saveEdit() {
    this.isEditing = false;
    // Optionally emit an event or update the file name elsewhere
  }

  deleteFile() {
    // Remove from service
    this.dataService.removeFile(this.data.name);
    this.delete.emit();
  }

  goToResults() {
    if (this.processingState !== 'processed') {
      return;
    }
    this.router.navigate(['/results'], { state: { file: this.file } });
  }
}
