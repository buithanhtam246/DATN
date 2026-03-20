import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  user: any;

  ngOnInit() {
    const data = localStorage.getItem('user');

    if (data) {
      this.user = JSON.parse(data);
    }
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    location.href = '/login';
  }

}
