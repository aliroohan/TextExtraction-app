import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { ImageService } from './image.service';

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
  processingState: 'uploaded' | 'processing' | 'processed' | 'error';
  processingStartTime?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private processedFiles = new BehaviorSubject<ProcessedFile[]>([]);
  private analysisResults = new Map<string, any>();
  private processingQueue: ProcessedFile[] = [];
  private processingSubscription?: Subscription;
  private isProcessingActive = false;

  constructor(private imageService: ImageService) {
    // Load saved data from localStorage on service initialization
    this.loadSavedData();
    // Start the background processing
    this.startBackgroundProcessing();
  }

  private loadSavedData() {
    const savedFiles = localStorage.getItem('processedFiles');
    const savedResults = localStorage.getItem('analysisResults');
    
    if (savedFiles) {
      const files = JSON.parse(savedFiles);
      // Restore processing state for files that were being processed
      files.forEach((file: ProcessedFile) => {
        if (file.processingState === 'processing') {
          // Add back to processing queue
          this.processingQueue.push(file);
        }
      });
      this.processedFiles.next(files);
    }
    
    if (savedResults) {
      const results = JSON.parse(savedResults);
      Object.entries(results).forEach(([key, value]) => {
        this.analysisResults.set(key, value);
      });
    }
  }

  private startBackgroundProcessing() {
    // Process queue every 2 seconds
    this.processingSubscription = interval(2000).subscribe(() => {
      this.processNextInQueue();
    });
  }

  private async processNextInQueue() {
    if (this.isProcessingActive || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessingActive = true;
    const fileToProcess = this.processingQueue.shift();
    
    if (fileToProcess) {
      try {
        console.log(`Starting background processing for: ${fileToProcess.fileObj.name}`);
        
        // Update processing state
        this.updateFileProcessingState(fileToProcess.fileObj.name, 'processing');
        
        const response = await this.imageService.analyzeImage(fileToProcess.file).toPromise();
        
        if (response?.body) {
          console.log(`Processing completed for: ${fileToProcess.fileObj.name}`);
          this.updateFileStatus(fileToProcess.fileObj.name, true, response.body);
          this.updateFileProcessingState(fileToProcess.fileObj.name, 'processed');
        }
      } catch (error) {
        console.error(`Error processing ${fileToProcess.fileObj.name}:`, error);
        this.updateFileProcessingState(fileToProcess.fileObj.name, 'error');
      }
    }
    
    this.isProcessingActive = false;
  }

  private updateFileProcessingState(fileName: string, state: 'uploaded' | 'processing' | 'processed' | 'error') {
    const currentFiles = this.processedFiles.value;
    const fileIndex = currentFiles.findIndex(f => f.fileObj.name === fileName);
    
    if (fileIndex !== -1) {
      currentFiles[fileIndex].processingState = state;
      this.processedFiles.next([...currentFiles]);
      this.saveToLocalStorage();
    }
  }

  // Get all processed files
  getProcessedFiles(): Observable<ProcessedFile[]> {
    return this.processedFiles.asObservable();
  }

  // Add a new file and start processing
  addFile(file: ProcessedFile) {
    const currentFiles = this.processedFiles.value;
    const existingFile = currentFiles.find(f => f.fileObj.name === file.fileObj.name);
    
    if (!existingFile) {
      // Set initial processing state
      file.processingState = 'uploaded';
      file.processingStartTime = new Date();
      
      currentFiles.push(file);
      this.processedFiles.next(currentFiles);
      
      // Add to processing queue after a short delay
      setTimeout(() => {
        this.processingQueue.push(file);
        console.log(`Added ${file.fileObj.name} to processing queue`);
      }, 1000);
      
      this.saveToLocalStorage();
    }
  }

  // Remove a file
  removeFile(fileName: string) {
    const currentFiles = this.processedFiles.value;
    const updatedFiles = currentFiles.filter(f => f.fileObj.name !== fileName);
    this.processedFiles.next(updatedFiles);
    
    // Remove from processing queue if it's there
    const queueIndex = this.processingQueue.findIndex(f => f.fileObj.name === fileName);
    if (queueIndex !== -1) {
      this.processingQueue.splice(queueIndex, 1);
    }
    
    // Remove analysis data
    this.analysisResults.delete(fileName);
    this.saveToLocalStorage();
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
      this.processedFiles.next([...currentFiles]);
      this.saveToLocalStorage();
    }
  }

  // Get processing queue status
  getProcessingQueueStatus(): { queueLength: number; isProcessing: boolean } {
    return {
      queueLength: this.processingQueue.length,
      isProcessing: this.isProcessingActive
    };
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
    this.processingQueue = [];
    localStorage.removeItem('processedFiles');
    localStorage.removeItem('analysisResults');
  }

  // Cleanup when service is destroyed
  ngOnDestroy() {
    if (this.processingSubscription) {
      this.processingSubscription.unsubscribe();
    }
  }
}
