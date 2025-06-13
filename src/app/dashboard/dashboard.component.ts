import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from "../dashboard/header/header.component";
import { NavComponent } from "../dashboard/nav/nav.component";
import { UploaderComponent } from "./uploader/uploader.component";
import { FileCardComponent } from "./file-card/file-card.component";
import { CommonModule } from '@angular/common';
import { DataService } from '../Services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, HeaderComponent, NavComponent, UploaderComponent, FileCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  files: any[] = [];
  activeTab = 'images';
  private subscription: Subscription;
  processingQueueStatus = { queueLength: 0, isProcessing: false };

  constructor(private dataService: DataService) {
    this.subscription = this.dataService.getProcessedFiles().subscribe(files => {
      this.files = files;
      // Update processing queue status
      this.processingQueueStatus = this.dataService.getProcessingQueueStatus();
    });
  }

  ngOnInit() {
    // Data will be loaded automatically by the service
    console.log('Dashboard initialized - background processing is active');
  }

  onFileUploaded(file: any) {
    this.dataService.addFile({
      ...file,
      processed: false,
      processingState: 'uploaded'
    });
  }

  onTabChange(tab: string) {
    this.activeTab = tab;
    console.log(`Switched to ${tab} tab - processing continues in background`);
  }

  getFilteredFiles() {
    if (this.files.length === 0) {
      return [];
    }
    if (this.activeTab === 'images') {
      return this.files.filter(file => file?.fileObj.type.startsWith('image/'));
    } else if (this.activeTab === 'documents') {
      return this.files.filter(file => file.fileObj.type === 'application/pdf');
    }
    return [];
  }

  onFileDeleted(fileName: string) {
    // File is already removed from service in FileCardComponent
    console.log(`File ${fileName} deleted`);
  }

  onFileRetry(file: any) {
    // First remove the file from any existing processing state
    this.dataService.removeFile(file.fileObj.name);
    
    // Then add it back as a new file to process
    setTimeout(() => {
      this.dataService.addFile({
        ...file,
        processed: false,
        processingState: 'uploaded'
      });
      console.log(`Retrying processing for file: ${file.fileObj.name}`);
    }, 100);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
