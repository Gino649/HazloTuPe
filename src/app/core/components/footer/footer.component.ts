import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  // 🌟 EMISOR DE EVENTOS: Alerta al componente principal del clic en los enlaces
  @Output() onNavigate = new EventEmitter<string>();

  public clickMenu(idSeccion: string): void {
    this.onNavigate.emit(idSeccion);
  }
}
