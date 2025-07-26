import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpinnerService } from '../core/spinner.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'vibeMe-app';
  public spinnerService = inject(SpinnerService);
   isLoading$ = this.spinnerService.loading$;
}
