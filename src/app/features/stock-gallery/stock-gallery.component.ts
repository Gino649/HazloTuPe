import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product/product.service';
import { CartService } from '../../core/services/cart/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-stock-gallery',
  standalone: true, // <-- AGREGAR ESTA LÍNEA OBLIGATORIA
  imports: [CommonModule],
  templateUrl: './stock-gallery.component.html'
})
export class StockGalleryComponent {
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  // Guardamos la categoría activa seleccionada por el usuario en una Signal
  public activeCategory = signal<Product['category'] | 'todos'>('todos');

  // Computed Signal: Filtra automáticamente los productos cada vez que cambia la categoría activa
  public filteredProducts = computed(() => {
    const category = this.activeCategory();
    const allProducts = this.productService.products();
    
    if (category === 'todos') {
      return allProducts;
    }
    return allProducts.filter(p => p.category === category);
  });

  /**
   * Cambia la pestaña de filtrado en la tienda
   */
  public changeCategory(category: Product['category'] | 'todos'): void {
    this.activeCategory.set(category);
  }

  /**
   * Flujo de Compra Rápida Directa (Sin pasar por el simulador)
   */
  public comprarDirecto(product: Product): void {
    // Para compras directas de stock, tomamos los valores por defecto
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : undefined;
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;

    this.cartService.addToCart({
      productId: product.id,
      name: product.name,
      category: product.category,
      price: product.basePrice,
      quantity: 1,
      size: defaultSize,
      colorCode: defaultColor?.code,
      colorName: defaultColor?.name,
      isCustomized: false // Compra de stock directa
    });

    alert(`¡${product.name} añadido al carrito correctamente!`);
  }

  /**
   * Redirección simulada al simulador cargando este recurso base
   */
  public abrirEnSimulador(product: Product): void {
    alert(`Cargando ${product.name} en el simulador interactivo para agregar texto o imágenes encima...`);
  }
}