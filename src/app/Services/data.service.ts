import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface ProcessedFile {
  fileObj: {
    name: string;
    type: string;
    previewUrl: string;
    date: Date;
  };
  file: File;
  processed: boolean;
  analysisData?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private processedFiles = new BehaviorSubject<ProcessedFile[]>([]);
  private analysisResults = new Map<string, any>();

  constructor() {
    // Load saved data from localStorage on service initialization
    this.loadSavedData();
  }

  private loadSavedData() {
    const savedFiles = localStorage.getItem('processedFiles');
    const savedResults = localStorage.getItem('analysisResults');
    
    if (savedFiles) {
      this.processedFiles.next(JSON.parse(savedFiles));
    }
    
    if (savedResults) {
      const results = JSON.parse(savedResults);
      Object.entries(results).forEach(([key, value]) => {
        this.analysisResults.set(key, value);
      });
    }
  }

  // Get all processed files
  getProcessedFiles(): Observable<ProcessedFile[]> {
    return this.processedFiles.asObservable();
  }

  // Add a new file
  addFile(file: ProcessedFile) {
    const currentFiles = this.processedFiles.value;
    const existingFile = currentFiles.find(f => f.fileObj.name === file.fileObj.name);
    
    if (!existingFile) {
      currentFiles.push(file);
      this.processedFiles.next(currentFiles);
      this.saveToLocalStorage();
    }
  }

  // Get analysis data for a specific file
  getAnalysisData(fileName: string): any {
    return this.analysisResults.get(fileName);
  }

  // Store analysis data for a file
  storeAnalysisData(fileName: string, data: any) {
    this.analysisResults.set(fileName, data);
    this.saveToLocalStorage();
  }

  // Update file processing status
  updateFileStatus(fileName: string, processed: boolean, analysisData?: any) {
    const currentFiles = this.processedFiles.value;
    const fileIndex = currentFiles.findIndex(f => f.fileObj.name === fileName);
    
    if (fileIndex !== -1) {
      currentFiles[fileIndex].processed = processed;
      if (analysisData) {
        currentFiles[fileIndex].analysisData = analysisData;
        this.storeAnalysisData(fileName, analysisData);
      }
      this.processedFiles.next(currentFiles);
      this.saveToLocalStorage();
    }
  }

  // Save current state to localStorage
  private saveToLocalStorage() {
    localStorage.setItem('processedFiles', JSON.stringify(this.processedFiles.value));
    const resultsObject = Object.fromEntries(this.analysisResults);
    localStorage.setItem('analysisResults', JSON.stringify(resultsObject));
  }

  // Clear all data
  clearData() {
    this.processedFiles.next([]);
    this.analysisResults.clear();
    localStorage.removeItem('processedFiles');
    localStorage.removeItem('analysisResults');
  }
}
