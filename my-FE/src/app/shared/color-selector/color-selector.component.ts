import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ColorSelector Component
 * 
 * Responsibility: Handle color selection UI (SRP)
 * - Display available colors
 * - Handle color selection
 * - Emit selection event to parent
 */
@Component({
  selector: 'app-color-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './color-selector.component.html',
  styleUrl: './color-selector.component.scss'
})
export class ColorSelectorComponent {
  @Input({ required: true }) colors: string[] = [];
  @Input() selectedColor?: string;
  
  @Output() colorSelected = new EventEmitter<string>();
  
  selectColor(color: string): void {
    this.colorSelected.emit(color);
  }
  
  isSelected(color: string): boolean {
    return this.selectedColor === color;
  }
}