import { Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-header',
    imports: [
      CommonModule,
      MatToolbarModule,
      MatIconModule,
      RouterModule,
      MatButtonModule
    ],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: true
})
export class HeaderComponent {
  readonly isLoggedIn = computed(() => this.authService.isAuthenticated());

  constructor(
    private authService: AuthService,
  ) {}
}