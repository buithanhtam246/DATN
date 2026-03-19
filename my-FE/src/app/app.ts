import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';


/**
 * Root App Component
 * 
 * Responsibility: Bootstrap application
 * - Render router outlet
 * - Layout is handled by route configuration
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('my-FE');
}
