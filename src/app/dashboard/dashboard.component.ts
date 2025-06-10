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

  constructor(private dataService: DataService) {
    this.subscription = this.dataService.getProcessedFiles().subscribe(files => {
      this.files = files;
    });
  }

  ngOnInit() {
    // Data will be loaded automatically by the service
  }

  onFileUploaded(file: any) {
    this.dataService.addFile({
      ...file,
      processed: false
    });
  }

  onTabChange(tab: string) {
    this.activeTab = tab;
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

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
