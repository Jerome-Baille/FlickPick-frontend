import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { BasicModalComponent } from 'src/app/shared/components/basic-modal/basic-modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
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
    this.authSubscription = this.authService.isLoggedIn.subscribe(
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
        this.authService.logout().subscribe(() => {
          this.router.navigate(['/auth']);
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}