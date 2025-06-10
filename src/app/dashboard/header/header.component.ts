import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../Services/data.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(private router: Router, private dataService: DataService) {}

  onSignOut() {
    this.dataService.clearData();
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }
} 