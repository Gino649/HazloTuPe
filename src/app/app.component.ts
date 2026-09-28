import { Component, OnInit, OnDestroy, signal, inject} from '@angular/core';
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
export class AppComponent implements OnInit {
  title = 'hazlotu-frontend';

  // Signal reactiva global para controlar la visibilidad del Simulador en Popup
  public isCustomizerOpen = signal<boolean>(false);

  public listaPromociones = signal<string[]>([]);
  public promoIndexActivo = signal<number>(0);
  private promoTimerInterval: any;

  ngOnInit() {
    this.cargarBannersPromocionales();
  }

  ngOnDestroy() {
    if (this.promoTimerInterval) {
      clearInterval(this.promoTimerInterval);
    }
  }

  public async cargarBannersPromocionales() {
    try {
      const baseAppUrl = window.location.origin;
      const response = await fetch(`${baseAppUrl}/assets/catalogo-maestro.json`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.promociones) {
          this.listaPromociones.set(data.promociones);
          
          // 🌟 ACTIVAR TEMPORIZADOR AUTOMÁTICO EXCLUSIVO:
          // Solo se enciende si logramos indexar más de una oferta en la carpeta
          if (data.promociones.length > 1) {
            this.iniciarAutoplayPromociones();
          }
        }
      }
    } catch (err) {
      console.error("Error al cargar banners de promociones:", err);
    }
  }

  /**
   * 🔄 MOTOR DE AUTOPLAY:
   * Mueve el banner superior derecho de forma fluida cada 4000 milisegundos
  */
  private iniciarAutoplayPromociones() {
    // Si ya existía un timer corriendo por seguridad lo reiniciamos
    if (this.promoTimerInterval) clearInterval(this.promoTimerInterval);

    this.promoTimerInterval = setInterval(() => {
      const total = this.listaPromociones().length;
      if (total > 0) {
        this.promoIndexActivo.update(index => (index + 1) % total);
      }
    }, 4000); // 🌟 Avanza automáticamente cada 4 segundos
  }

  // Métodos de control para avanzar y retroceder el carrusel de ofertas
  public siguientePromo() {
    const total = this.listaPromociones().length;
    if (total > 0) this.promoIndexActivo.update(i => (i + 1) % total);
    this.iniciarAutoplayPromociones(); // Reinicia el tiempo si el usuario le dio clic manual
  }

  public anteriorPromo() {
    const total = this.listaPromociones().length;
    if (total > 0) this.promoIndexActivo.update(i => (i - 1 + total) % total);
    this.iniciarAutoplayPromociones(); // Reinicia el tiempo
  }

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

  public procesarNavegacionHeader(idSeccion: string): void {
    // Al estar dentro de app.component, podemos invocar tu función nativa sin problemas
    if (idSeccion === 'simuladorSeccion') {
      this.abrirSimulador('prod-polo-pima'); 
    }

    // Esperamos 60ms a que Angular renderice el bloque y aplicamos el scroll fluido
    setTimeout(() => {
      const elementoDestino = document.getElementById(idSeccion);
      if (elementoDestino) {
        elementoDestino.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 60);
  }
}
