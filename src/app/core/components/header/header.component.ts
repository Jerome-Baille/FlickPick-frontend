import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { BasicModalComponent } from 'src/app/shared/components/basic-modal/basic-modal.component';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
    selector: 'app-header',
    imports: [CommonModule, MatToolbarModule, MatIconModule, MatListModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.sass'],
    standalone: true
})
export class HeaderComponent implements OnDestroy {
  isLoggedIn = false;
  isDrawerOpen = false;
  private authSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.authSubscription = this.authService.waitForAuthState().subscribe(
      (isLoggedIn: boolean) => {
        this.isLoggedIn = isLoggedIn;
      }
    );
  }

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

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}