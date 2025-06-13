import { Component, Input } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CopytextComponent } from "./copytext/copytext.component";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-text',
  imports: [ClipboardModule, CopytextComponent, CommonModule],
  templateUrl: './text.component.html',
  styleUrl: './text.component.scss'
})
export class TextComponent {
  @Input() analysis: any = {};

  textContent: any;
  copySuccess = false;

  ngOnInit(){
    this.textContent = this.analysis.file.analysisData.extracted_text;
  }
  onCopySuccess(successful: boolean) {
    this.copySuccess = successful;
    if (successful) {
      setTimeout(() => this.copySuccess = false, 2000);
    }
  }
}
