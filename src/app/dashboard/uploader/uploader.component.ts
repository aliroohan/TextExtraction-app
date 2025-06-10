import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss']
})
export class UploaderComponent {
  @Output() fileSelected = new EventEmitter<any>();
  @Output() process = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();

  selectedFile: File | null = null;
  isPdfFile: boolean = false;
  isProcessing: boolean = false;

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    console.log(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileObj = {
          name: file.name,
          type: file.type,
          previewUrl: reader.result,
          date: new Date(),
        };
        this.fileSelected.emit({fileObj, file});
      };
      reader.readAsDataURL(file);
    }
  }

  onProcess(): void {
    this.isProcessing = true;
    this.process.emit();
  }

  onClear(): void {
    this.selectedFile = null;
    this.isPdfFile = false;
    this.isProcessing = false;
    this.clear.emit();
  }

  setProcessing(processing: boolean): void {
    this.isProcessing = processing;
  }
} 