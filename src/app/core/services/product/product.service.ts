import { Injectable, signal } from '@angular/core';
import { Product, UbigeoPeru } from '../../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Catálogo maestro inmutable expuesto a través de Angular Signals
  private readonly productsCatalog = signal<Product[]>([
    {
      id: 'prod-polo-pima',
      name: 'Polo Premium Algodón Pima',
      description: 'Polo de alta calidad 100% Algodón Pima peruano. Corte moderno, fresco y de máxima resistencia al lavado.',
      basePrice: 45.00,
      category: 'prenda',
      isCustomizable: true,
      sizes: ['S', 'M', 'L', 'XL'],
      allowedLocations: ['pecho', 'espalda', 'manga_izq', 'manga_der'],
      folderKey: "polos",
      boundingBoxes: { pecho: { width: 30, height: 40, top: 80, left: 100 } },
      colors: [
        { code: '#111111', name: 'Negro Absoluto', images: { model3d: 'assets/models/polo_pima.gltf' } },
        { code: '#ffffff', name: 'Blanco Pima', images: { model3d: 'assets/models/polo_pima.gltf' } },
        { code: '#facc15', name: 'Amarillo Pollito', images: { model3d: 'assets/models/polo_pima.gltf' } },
        { code: '#38bdf8', name: 'Celeste Bebé', images: { model3d: 'assets/models/polo_pima.gltf' } },
        { code: '#ef4444', name: 'Rojo Pasión', images: { model3d: 'assets/models/polo_pima.gltf' } },
        { code: '#22c55e', name: 'Verde Perico', images: { model3d: 'assets/models/polo_pima.gltf' } }
      ]
    },
    {
      id: 'prod-polo-pique',
      name: 'Polo Piqué Premium (Con Cuello)',
      description: 'Polo clásico con cuello camisero y botones. Tejido piqué de alta densidad, elegante y confortable.',
      basePrice: 55.00,
      category: 'prenda',
      isCustomizable: true,
      sizes: ['M', 'L', 'XL'],
      allowedLocations: ['pecho', 'espalda'],
      folderKey: "pique",
      boundingBoxes: { pecho: { width: 30, height: 40, top: 80, left: 100 } },
      colors: [
        { code: '#ffffff', name: 'Blanco Piqué', images: { model3d: 'assets/models/polo_pique.gltf' } },
        { code: '#111111', name: 'Negro Elegante', images: { model3d: 'assets/models/polo_pique.gltf' } },
        { code: '#1d4ed8', name: 'Azul Francia', images: { model3d: 'assets/models/polo_pique.gltf' } }
      ]
    },
    {
      id: 'prod-jean-urbano',
      name: 'Jean Denim Urbano Premium',
      description: 'Jean denim 100% algodón stretch de alta resistencia. Diseñado para estampar en muslos o bolsillos traseros.',
      basePrice: 89.00,
      category: 'prenda',
      isCustomizable: true,
      sizes: ['30', '32', '34', '36'],
      allowedLocations: ['muslo_frontal', 'bolsillo_der'],
      folderKey: "jean",
      boundingBoxes: { muslo_frontal: { width: 20, height: 35, top: 140, left: 120 } },
      colors: [
        { code: '#2b4c7e', name: 'Azul Denim Clásico', images: { model3d: 'assets/models/jean.gltf' } }
      ]
    },
    {
      id: 'prod-short-fresco',
      name: 'Short Fleece Streetwear',
      description: 'Short cómodo de felpa de algodón, perfecto para el estilo urbano casual.',
      basePrice: 49.00,
      category: 'prenda',
      isCustomizable: true,
      sizes: ['S', 'M', 'L'],
      allowedLocations: ['muslo_frontal', 'bolsillo_izq'],
      folderKey: "shorts",
      boundingBoxes: { muslo_frontal: { width: 18, height: 20, top: 120, left: 90 } },
      colors: [
        { code: '#64748b', name: 'Gris Plomo', images: { model3d: 'assets/models/short.gltf' } }
      ]
    },
    // =================================================================
    // NUEVO PRODUCTO INTEGRADO: MEDIAS URBANAS PREMIUM
    // =================================================================
    {
      id: 'prod-medias-urbanas',
      name: 'Medias Altas Streetwear',
      description: 'Medias caña alta de algodón acolchado con elástico de alta retención. Ideales para estampar patrones o logotipos laterales.',
      basePrice: 18.00,
      category: 'prenda',
      isCustomizable: true,
      sizes: ['Estándar (38-43)'],
      allowedLocations: ['manga_izq', 'manga_der'], // Mapeamos lateral izquierdo y derecho en las costuras
      folderKey: "medias",
      boundingBoxes: { manga_izq: { width: 10, height: 25, top: 50, left: 50 } },
      colors: [
        { code: '#ffffff', name: 'Blanco Urbano', images: { model3d: 'assets/models/medias.gltf' } },
        { code: '#111111', name: 'Negro Street', images: { model3d: 'assets/models/medias.gltf' } }
      ]
    },
    {
    id: 'prod-cuadro-aluminio',
    name: 'Cuadros de Aluminio Fotográfico',
    description: 'Dale brillo eterno a tus recuerdos familiares. Resistente al agua y decoloración.',
    basePrice: 60.00,
    category:'cuadro_aluminio',
    isCustomizable: true,
    sizes: ['20 x 30cm', '30 x 40cm', '40 x 60cm'],    
    allowedLocations: ['lienzo_completo'],
    folderKey: "laminas",
    boundingBoxes: {},
    colors: [{ code: '#e2e8f0',name: 'Aluminio Natural',images:{} }]    
  },
  {
    id: 'prod-pack-imanes',
    name: 'Pack de Fotos Imanes Decorativos',
    description: 'Decora tu refri con tus fotos de viajes, series favoritas o las mejores plantillas de memes.',
    basePrice: 25.00,
    category:'cuadro_aluminio',
    isCustomizable: true,
    sizes: ['Pack x6', 'Pack x12', 'Pack x24'],
    allowedLocations: ['frente'],
    folderKey: "imanes",
    boundingBoxes: {},
    colors: [{ code: '#ffffff',name: 'Blanco Fotográfico',images:{} }]
  },
  {
    id: 'prod-body-bebe',
    name: 'Bodys de Algodón Pima para Bebé',
    description: 'Imprime frases graciosas, tiernas o el escudo de tu equipo sobre el algodón más suave de todos.',
    basePrice: 35.00, 
    category:'prenda',
    isCustomizable: true,   
    sizes: ['0-3M', '3-6M', '6-9M', '9-12M'],
    allowedLocations: ['pecho', 'espalda'],
    folderKey: "bebe",
    boundingBoxes: {},
    colors: [
      { code: '#ffffff',name: 'Blanco Bebé', images:{} },
      { code: '#bae6fd',name: 'Celeste Pastel', images:{} },
      { code: '#fbcfe8',name: 'Rosado Pastel', images:{} }
    ]
  }
  ]);

  // Base de datos de Ubigeos con tarifas de envío locales autorizadas para el Checkout
  private readonly ubigeosCatalog = signal<UbigeoPeru[]>([
    { ubigeoCode: '150101', departamento: 'Lima', provincia: 'Lima', distrito: 'Lima Cercado', deliveryCost: 10.00 },
    { ubigeoCode: '150142', departamento: 'Lima', provincia: 'Lima', distrito: 'Miraflores', deliveryCost: 10.00 },
    { ubigeoCode: '150131', departamento: 'Lima', provincia: 'Lima', distrito: 'San Isidro', deliveryCost: 10.00 },
    { ubigeoCode: '150104', departamento: 'Lima', provincia: 'Lima', distrito: 'Barranco', deliveryCost: 10.00 },
    { ubigeoCode: '040101', departamento: 'Arequipa', provincia: 'Arequipa', distrito: 'Arequipa', deliveryCost: 20.00 },
    { ubigeoCode: '130101', departamento: 'La Libertad', provincia: 'Trujillo', distrito: 'Trujillo', deliveryCost: 20.00 },
    { ubigeoCode: '200101', departamento: 'Piura', provincia: 'Piura', distrito: 'Piura', deliveryCost: 20.00 }
  ]);

  // Exposición pública como Readonly Signals para mantener la inmutabilidad arquitectónica
  public readonly products = this.productsCatalog.asReadonly();
  public readonly ubigeos = this.ubigeosCatalog.asReadonly();

  /**
   * Recupera un producto específico por su identificador único
   */
  public getProductById(id: string): Product | undefined {
    return this.productsCatalog().find(p => p.id === id);
  }

  /**
   * Filtra los productos del catálogo según su categoría comercial
   */
  public getProductsByCategory(category: Product['category']): Product[] {
    return this.productsCatalog().filter(p => p.category === category);
  }
}