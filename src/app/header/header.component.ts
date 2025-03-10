import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { BasicModalComponent } from 'src/app/shared/basic-modal/basic-modal.component';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-header',
    imports: [
      CommonModule,
      MatToolbarModule,
      MatIconModule,
      MatListModule,
      RouterModule,
      MatButtonModule
    ],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: true
})
export class HeaderComponent {
  isDrawerOpen = false;

  constructor(
    private authService: AuthService,
    public dialog: MatDialog
  ) {}

  isLoggedIn = this.authService.isAuthenticated;

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  onLogout() {
    const dialogRef = this.dialog.open(BasicModalComponent, {
      data: {
        title: 'Logout',
        message: 'Are you sure you want to log out?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        try {
          this.authService.logout();
        } catch (error) {
          console.error('Failed to redirect for logout', error);
        }
      }
    });
  }
}