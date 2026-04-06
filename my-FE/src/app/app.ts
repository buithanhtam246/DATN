import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

<<<<<<< HEAD

=======
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
/**
 * Root App Component
 * 
 * Responsibility: Bootstrap application
 * - Render router outlet
 * - Layout is handled by route configuration
 */
@Component({
  selector: 'app-root',
<<<<<<< HEAD
  imports: [RouterOutlet,],
=======
  imports: [RouterOutlet],
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('my-FE');
}
