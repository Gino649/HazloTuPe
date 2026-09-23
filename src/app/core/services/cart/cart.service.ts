import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  // Estado principal manejado con una Signal reactiva privada
  private cartItemsSignal = signal<CartItem[]>([]);

  // Selector público expuesto para que los componentes lean el estado
  public readonly items = this.cartItemsSignal.asReadonly();

  // Contadores y cálculos financieros calculados automáticamente de forma limpia (Computed Signals)
  public readonly totalItemsCount = computed(() => {
    return this.cartItemsSignal().reduce((acc, item) => acc + item.quantity, 0);
  });

  // En Perú el precio de venta final de cara al público suele incluir el IGV.
  // Modelaremos el subtotal bruto (sin impuesto), el valor del IGV (18%) y el Total General neto.
  public readonly totalGeneral = computed(() => {
    return this.cartItemsSignal().reduce((acc, item) => acc + (item.price * item.quantity), 0);
  });

  public readonly subtotalNeto = computed(() => {
    return this.totalGeneral() / 1.18;
  });

  public readonly igvCalculado = computed(() => {
    return this.totalGeneral() - this.subtotalNeto();
  });

  constructor() {
    // Persistencia básica en LocalStorage para no perder la navegación interactiva al recargar
    const savedCart = localStorage.getItem('hazlotu_cart');
    if (savedCart) {
      try {
        this.cartItemsSignal.set(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error al inicializar el almacenamiento del carrito:', e);
      }
    }
  }

  /**
   * Añade un ítem al carrito o incrementa su cantidad si es exactamente idéntico en propiedades
   */
  addToCart(newItem: Omit<CartItem, 'id'>): void {
    const currentItems = this.cartItemsSignal();
    
    // Validamos si ya existe un producto con los mismos atributos (Mismo ID, talla, color y personalización)
    const existingItemIndex = currentItems.findIndex(item => 
      item.productId === newItem.productId &&
      item.size === newItem.size &&
      item.colorCode === newItem.colorCode &&
      JSON.stringify(item.customDesigns) === JSON.stringify(newItem.customDesigns)
    );

    if (existingItemIndex > -1) {
      // Si existe, mutamos la cantidad de forma segura creando un nuevo arreglo (inmutabilidad)
      const updatedItems = currentItems.map((item, index) => 
        index === existingItemIndex 
          ? { ...item, quantity: item.quantity + newItem.quantity }
          : item
      );
      this.updateState(updatedItems);
    } else {
      // Si es nuevo, generamos un identificador único en el frontend
      const itemWithId: CartItem = {
        ...newItem,
        id: crypto.randomUUID()
      };
      this.updateState([...currentItems, itemWithId]);
    }
  }

  /**
   * Remueve un elemento por su identificador único
   */
  removeFromCart(itemId: string): void {
    const updatedItems = this.cartItemsSignal().filter(item => item.id !== itemId);
    this.updateState(updatedItems);
  }

  /**
   * Actualiza la cantidad directamente desde los controles de la vista del carrito
   */
  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }
    
    const updatedItems = this.cartItemsSignal().map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    this.updateState(updatedItems);
  }

  /**
   * Vacía por completo el estado del carrito tras una compra exitosa
   */
  clearCart(): void {
    this.updateState([]);
  }

  /**
   * Helper privado para centralizar la mutación de la Signal y su almacenamiento
   */
  private updateState(newItems: CartItem[]): void {
    this.cartItemsSignal.set(newItems);
    localStorage.setItem('hazlotu_cart', JSON.stringify(newItems));
  }
}
