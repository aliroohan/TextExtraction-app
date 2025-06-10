import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  imports: [CommonModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent {
  @Output() tabChange = new EventEmitter<string>();
  activeTab = 'images';

  onTabClick(tab: string) {
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }
}
