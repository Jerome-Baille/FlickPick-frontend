import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-header',
    imports: [
      CommonModule,
      RouterModule
    ],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: true
})
export class HeaderComponent {
  private authService = inject(AuthService);

  readonly isLoggedIn = computed(() => this.authService.isAuthenticated());
}