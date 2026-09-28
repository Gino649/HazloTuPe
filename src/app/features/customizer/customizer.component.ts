import { Component, inject, ViewChild ,signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product/product.service';
import { CartService } from '../../core/services/cart/cart.service';
import { Product, ColorVariant } from '../../models/product.model';
import { CanvasViewerComponent } from './components/canvas-viewer/canvas-viewer.component';

@Component({
  selector: 'app-customizer',
  standalone: true,
  imports: [CommonModule, CanvasViewerComponent],
  templateUrl: './customizer.component.html'
})
export class CustomizerComponent {
  @ViewChild(CanvasViewerComponent) canvasChild!: CanvasViewerComponent;

  public productService = inject(ProductService);
  private cartService = inject(CartService);

  // Estados reactivos principales
  public selectedProduct = signal<Product | undefined>(undefined);
  public selectedColor = signal<ColorVariant | undefined>(undefined);
  public selectedSize = signal<string>('');

  // Lógica de personalización textual y de indicaciones
  public activeText = signal<string>('');
  public activeFont = signal<string>('Impact');
  public activeTextColor = signal<string>('#facc15');
  public userObservations = signal<string>(''); // <-- NUEVO: Guarda comentarios del taller

  public withTextFont: string = 'Impact';

  constructor() {
    // Inicialización del producto insignia por defecto
    const defaultProduct = this.productService.getProductById('prod-polo-pima');
    if (defaultProduct) {
      this.selectedProduct.set(defaultProduct);
      if (defaultProduct.colors && defaultProduct.colors.length > 0) this.selectedColor.set(defaultProduct.colors[0]);
      if (defaultProduct.sizes && defaultProduct.sizes.length > 0) this.selectedSize.set(defaultProduct.sizes[0]);
    }
  }

  public seleccionarPrendaBase(id: string): void {
    const prod = this.productService.getProductById(id);
    if (prod) {
      this.selectedProduct.set(prod);
      if (prod.colors && prod.colors.length > 0) this.selectedColor.set(prod.colors[0]);
      if (prod.sizes && prod.sizes.length > 0) this.selectedSize.set(prod.sizes[0]);
    }
  }

  public agregarAlCarrito(): void {
    const product = this.selectedProduct();
    if (!product) return;

    alert(`¡Diseño de ${product.name} (Talla ${this.selectedSize()}) guardado!\nIndicaciones para taller: "${this.userObservations()}"`);
  }

  public updateFontField(fontName: string): void {
    this.withTextFont = fontName;
    this.activeFont.set(fontName);
  }

  /**
   * 🚀 PUENTE DE DESCARGA:
   * Llama a la función de exportación que reside dentro del TypeScript del canvas
  */
  public triggerWhatsAppCheckout() {
    if (this.canvasChild) {
      this.canvasChild.enviarPedidoWhatsApp(this.userObservations(),this.selectedSize());
    } else {
      console.warn("El simulador de canvas aún no está listo en la pantalla.");
    }
  }

  
}