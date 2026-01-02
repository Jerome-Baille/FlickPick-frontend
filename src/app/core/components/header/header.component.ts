import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-header',
    imports: [
      CommonModule,
      RouterModule,
      MatDialogModule
    ],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: true
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  readonly isLoggedIn = computed(() => this.authService.isAuthenticated());

  onLogoutClick() {
    this.dialog.open(ConfirmationDialogComponent, {
      width: '480px',
      maxWidth: '90vw',
      panelClass: 'confirmation-dialog-panel',
      disableClose: false,
      autoFocus: false,
      data: {
        title: 'Logout Confirmation',
        message: 'Are you sure you want to sign out of your account?',
        icon: 'logout',
        iconFilled: true,
        confirmText: 'Yes, Logout',
        cancelText: 'Cancel'
      }
    }).afterClosed().subscribe(result => {
      if (result === true) {
        this.authService.logout();
      }
    });
  }
}
