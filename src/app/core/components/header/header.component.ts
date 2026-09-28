import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart/cart.service';  

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  public cartService = inject(CartService);

  @Output() onNavigate = new EventEmitter<string>();
  public clickMenu(idSeccion: string): void {
    // Emitimos el ID hacia el padre (app.component)
    this.onNavigate.emit(idSeccion);
  }  
}
