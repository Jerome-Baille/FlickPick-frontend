import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent {
  isLoggedIn = false;
  isDrawerOpen = false;

  constructor(
    private authService: AuthService
  ) {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
    });
  }

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  onLogout() {
    if (confirm('Are you sure you want to log out?')) {
      this.authService.logout();
    }
  }
}
