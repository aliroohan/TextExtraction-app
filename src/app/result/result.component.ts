import { Component } from '@angular/core';
import { HeaderComponent } from "../dashboard/header/header.component";
import { TextComponent } from "./text/text.component";
import { CommonModule } from '@angular/common';
import { PreviewComponent } from "./preview/preview.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-result',
  imports: [HeaderComponent, TextComponent, CommonModule, PreviewComponent],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss'
})
export class ResultComponent {
  file!: any;
  name: string = '';

  constructor(private router: Router) {}

  ngOnInit(){
    if (history.state){
     this.file = history.state;
    }
    console.log(this.file);
    this.name = this.file.file.fileObj.name;
  }

  goBack(){
    this.router.navigate(['/dashboard']);
  }

}
