// Define las zonas específicas donde el cliente puede estampar sus imágenes
export type ViewLocation = 'pecho' | 'espalda' | 'manga_izq' | 'manga_der' | 'bolsillo_izq' | 'bolsillo_der' | 'muslo_frontal' | 'lienzo_completo' | 'frente';

// Caja de límites lógicos (en píxeles sobre el mockup) para restringir el arrastre fuera de la costura
export interface BoundingBox {
  width: number;  
  height: number;
  top: number;    
  left: number;
}

// Representa una variante de color de la prenda con sus imágenes de fondo correspondientes
export interface ColorVariant {
  code: string;  // Ej: '#111111', '#ffffff'
  name: string;  // Ej: 'Negro Absoluto', 'Blanco Pima'
  
  // Cambiamos a index signature directo para que acepte las claves sin que TypeScript proteste
  images: { [key in ViewLocation]?: string } & Record<string, string | undefined>;
}
// Modelo principal de un Producto en catálogo
export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number; // Precio base en Soles (S/.)
  category: 'prenda' | 'lamina_dtf' | 'cuadro_aluminio' | 'iman' | 'bebe';
  isCustomizable: boolean;
  colors?: ColorVariant[];
  sizes?: string[]; // Variantes de tallas, ej: ['S', 'M', 'L', 'XL']
  allowedLocations: ViewLocation[];
  boundingBoxes: { [key in ViewLocation]?: BoundingBox } & Record<string, BoundingBox | undefined>;
}

// Guarda la configuración del Canvas que el cliente diseña en una vista específica
export interface CustomDesignView {
  location: ViewLocation;
  clientImageSrc: string; // URL o base64 de la imagen del cliente sin fondo
  canvasDataUrl: string;  // Captura final combinada (Prenda + Estampado) exportada a producción
  scale: number;
  rotation: number;
  position: { x: number; y: number };
}

// Estructura de un elemento dentro del Carrito de Compras
export interface CartItem {
  id: string; // Identificador único interno generado por el carrito (UUID)
  productId: string;
  name: string;
  category: string;
  price: number; // Precio final de venta calculado
  quantity: number;
  size?: string;
  colorCode?: string;
  colorName?: string;
  isCustomized: boolean;
  customDesigns?: CustomDesignView[]; // Diseños activos de estampados si es personalizado
}

// Estructura de Ubigeos oficiales para fletes de despacho local
export interface UbigeoPeru {
  departamento: string;
  provincia: string;
  distrito: string;
  ubigeoCode: string;
  deliveryCost: number; // Costo flat en Soles (S/. 10 Lima, S/. 20 Provincias)
}