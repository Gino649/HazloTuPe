import { Component, inject, signal, computed,OnInit } from '@angular/core';
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
export class StockGalleryComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  // 🌟 SIGNAL PARA ALMACENAR TODAS LAS RUTAS DE IMÁGENES DEL JSON MAESTRO
  public catalogImages = signal<Record<string, string[]>>({});

  // SIGNALS PARA GESTIONAR EL MODAL FLOTANTE EN ALTA DEFINICIÓN
  public isModalOpen = signal<boolean>(false);
  public selectedModalImage = signal<string>('');
  public selectedModalTitle = signal<string>('');

  public miCelularPersonal: string = '51959087092'; 
  public activeIndices = signal<Record<string, number>>({});

  // Guardamos la categoría activa seleccionada por el usuario en un Signal
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
   * 🌟 AL INICIAR EL COMPONENTE:
   * Cargamos el archivo JSON indexado autogenerado por Node.js de tus assets
   */
  ngOnInit(): void {
    this.loadCatalogMaestroData();
  }

  public async loadCatalogMaestroData() {
    try {
      const baseAppUrl = window.location.origin;
      const response = await fetch(`${baseAppUrl}/assets/catalogo-maestro.json`);
      if (response.ok) {
        const data = await response.json();
        // Almacenamos el JSON indexado completo con las carpetas 'polos', 'bebe', 'imanes', etc.
        this.catalogImages.set(data || {});
      }
    } catch (err) {
      console.error("Error al cargar el catálogo de imágenes en stock:", err);
    }
  }

  /**
   * Cambia la pestaña de filtrado en la tienda
   */
  public changeCategory(category: Product['category'] | 'todos'): void {
    this.activeCategory.set(category);
  }

  /**
   * 🌟 MANEJADORES DEL MODAL FLOTANTE INTERACTIVO
   */
  public openImageModal(imgSrc: string, productTitle: string): void {
    this.selectedModalImage.set(imgSrc);
    this.selectedModalTitle.set(productTitle);
    this.isModalOpen.set(true);
  }

  public closeImageModal(): void {
    this.isModalOpen.set(false);
    this.selectedModalImage.set('');
    this.selectedModalTitle.set('');
  }

  /**
   * 🛒 FLUJO DE COMPRA RÁPIDA DIRECTA REFORMULADO
   * Compra el producto en stock directo basándose en el modelo físico real
  */
  public comprarDirecto(product: Product, selectedImageSrc?: string): void {
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0]?.name : 'No especificado';
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M';
    
    // Si el usuario le dio al botón general de la tarjeta sin tocar una foto del carrusel,
    // tomamos la primera imagen disponible de esa carpeta como respaldo.
    let imagenFinal = selectedImageSrc;
    if (!imagenFinal) {
      const folderKey = (product as any).folderKey || product.id;
      const availableImages = this.catalogImages()[folderKey];
      imagenFinal = availableImages && availableImages.length > 0 ? availableImages[0] : 'assets/logo.png';
    }

    // 🌟 Construimos el mensaje de pedido directo
    const mensajeFormateado = `¡Hola! 👋 Deseo comprar el siguiente producto del Catálogo de Stock:

    📦 *PRODUCTO:* ${product.name}
    💰 *PRECIO:* S/. ${product.basePrice.toFixed(2)}
    📏 *TALLA REQUERIDA:* ${defaultSize}
    🎨 *COLOR:* ${defaultColor}

    🖼️ *DISEÑO ELEGIDO:* ${window.location.origin}/${imagenFinal}

    📌 _Por favor, confírmame disponibilidad para coordinar el pago y despacho express._`;

    // Codificamos el mensaje para que viaje seguro por internet
    const mensajeCodificado = encodeURIComponent(mensajeFormateado);

    // Creamos la URL limpia con la barra inclinada '/' obligatoria
    const urlWhatsApp = "https://wa.me/" + this.miCelularPersonal + "?text=" + mensajeCodificado;

    // Redirección instantánea hacia tu WhatsApp personal
    window.open(urlWhatsApp, '_blank');
  }

  public getProductIndex(folderKey: string): number {
    return this.activeIndices()[folderKey] || 0;
  }

  public nextImage(folderKey: string, totalImages: number): void {
    const currentIndex = this.getProductIndex(folderKey);
    const nextIndex = (currentIndex + 1) % totalImages;
    this.activeIndices.update(prev => ({ ...prev, [folderKey]: nextIndex }));
  }

  public prevImage(folderKey: string, totalImages: number): void {
    const currentIndex = this.getProductIndex(folderKey);
    const prevIndex = (currentIndex - 1 + totalImages) % totalImages;
    this.activeIndices.update(prev => ({ ...prev, [folderKey]: prevIndex }));
  }
}