import { Component, signal  } from '@angular/core';
import { HeaderComponent } from './core/components/header/header.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { StockGalleryComponent } from './features/stock-gallery/stock-gallery.component';
import { CustomizerComponent } from './features/customizer/customizer.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent, 
    FooterComponent, 
    StockGalleryComponent,
    CustomizerComponent 
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'hazlotu-frontend';

  // Signal reactiva global para controlar la visibilidad del Simulador en Popup
  public isCustomizerOpen = signal<boolean>(false);

  public abrirSimulador(productId?: string): void {
    this.isCustomizerOpen.set(true);

    // Si el usuario viene desde un producto específico del catálogo, forzamos el cambio de molde
    if (productId) {
      setTimeout(() => {
        // Buscamos el componente del simulador en el DOM para inyectarle el ID seleccionado
        const customizerRef = document.querySelector('app-customizer');
        if (customizerRef && (customizerRef as any).__ngContext__) {
          // Invocamos nativamente el método de cambio que ya tienes programado
          const componentInstance = (customizerRef as any)._customizerInstance || (customizerRef as any).seleccionarPrendaBase;
          if (typeof (customizerRef as any).seleccionarPrendaBase === 'function') {
            (customizerRef as any).seleccionarPrendaBase(productId);
          }
        }
      }, 50); // Pequeño delay de 50ms para esperar que el Popup termine de abrirse
    }
  }

  public cerrarSimulador(): void {
    this.isCustomizerOpen.set(false);
  }
}
