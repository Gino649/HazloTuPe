import { Component, ElementRef, computed, Input, ViewChild, AfterViewInit, OnChanges, SimpleChanges, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as fabric from 'fabric'; 
import {BackgroundRemovalService } from '../../../../core/services/removal/background-removal.service';

declare global {
  interface Window {
    ort: any;
  }
}

interface DtfDesignItem {
  id: string;
  titulo: string;
  rutaWeb: string;
  categoria: string;
}

@Component({
  selector: 'app-canvas-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Contenedor general adaptable -->
    <div class="relative w-full max-w-[550px] bg-white rounded-3xl overflow-hidden shadow-inner border border-gray-100 flex flex-col items-center justify-center p-2 select-none origin-center touch-none">
      
      <!-- BOTÓN FLOTANTE PREMIUM DE LUPA CORREGIDO -->
      <button 
        (click)="applyMultiLevelZoom()" 
        class="absolute top-4 right-4 bg-gray-900/95 hover:bg-orange-600 text-white px-3 h-9 rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-all transform active:scale-95 cursor-pointer z-30 border border-white/10 text-[10px] font-black tracking-wider uppercase backdrop-blur-xs">
        <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.636ZM10.5 7.5v6m3-3h-6" />
        </svg>
        <span>Zoom: {{ zoomLevel() }}x</span>
      </button>

      <!-- INDICADOR DE DESPLAZAMIENTO UX -->
      @if (zoomLevel() > 1) {
        <div class="absolute bottom-13 left-4 right-4 md:right-auto bg-orange-600 text-white text-[8px] font-black px-2 py-2 rounded-md uppercase tracking-wider z-30 shadow-sm animate-pulse text-center md:text-left">
          🤚 Toque sostenido y arrastra para mover las prendas
        </div>
      }

      <!-- INDICADOR DE PROCESAMIENTO DE IA FLOTANTE -->
      @if (isProcessingBg()) {
        <div class="absolute inset-0 bg-white/70 backdrop-blur-xs z-40 flex flex-col items-center justify-center gap-2">
          <div class="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-[11px] font-black text-gray-900 uppercase tracking-widest">Removiendo fondo...</p>
        </div>
      }

      <!-- CONTENEDOR RESPONSIVO BLINDADO -->
      <div class="w-full aspect-[29/19] md:w-[580px] md:h-[350px] relative overflow-hidden rounded-2xl bg-gray-50/50 flex items-center justify-center">
        
        <div class="w-[580px] h-[350px] relative transition-transform duration-300 ease-out origin-center shrink-0 max-sm:[transform:scale(calc(var(--mobile-scale,0.65)))]"
             [style.transform]="'scale(' + zoomLevel() + ')'"
             [style.left.px]="panOffset.x"
             [style.top.px]="panOffset.y"
             [style.touchAction]="'none'"
             (mousedown)="onPanStart($event)"
             (mousemove)="onPanMove($event)"
             (mouseup)="onPanEnd()"
             (mouseleave)="onPanEnd()"
             (touchstart)="onTouchPanStart($event)"
             (touchmove)="onTouchPanMove($event)"
             (touchend)="onPanEnd()"
             [class.cursor-grab]="zoomLevel() > 1"
             [class.cursor-grabbing]="isPanning && zoomLevel() > 1">
             
          <!-- CAPA 1: MOLDES VECTORIALES NATIVOS ANCHOS -->
          <div class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <svg xmlns="http://w3.org" width="580" height="350" viewBox="0 0 580 350" class="w-full h-full">
              <!-- Moldes de tus polos (Frente y Espalda) intactos -->
              <g transform="translate(40, 20)">
                @if (currentProductId === 'prod-polo-pima' || currentProductId === 'prod-polo-pique') {
                  <path d="M40,40 L160,40 L210,80 L180,120 L155,110 L155,240 L45,240 L45,110 L20,120 L-10,80 Z" [attr.fill]="colorCode" [attr.stroke]="getStrokeColor()" stroke-width="3" stroke-linejoin="round"/>
                  <path d="M40,40 Q100,72 160,40" fill="none" [attr.stroke]="getStrokeColor()" stroke-width="2.8"/>
                  @if (currentProductId === 'prod-polo-pique') {
                    <path d="M40,40 L100,75 L160,40" fill="none" [attr.stroke]="getStrokeColor()" stroke-width="2.5"/>
                    <path d="M100,75 L100,125" fill="none" [attr.stroke]="getStrokeColor()" stroke-width="2"/>
                  }
                } @else if (currentProductId === 'prod-jean-urbano') {
                  <path d="M30,30 L150,30 L165,300 L115,300 L97,140 L79,300 L30,300 Z" [attr.fill]="colorCode" [attr.stroke]="getStrokeColor()" stroke-width="3" stroke-linejoin="round"/>
                } @else if (currentProductId === 'prod-short-fresco') {
                  <path d="M30,30 L150,30 L165,190 L115,190 L97,130 L79,190 L30,190 Z" [attr.fill]="colorCode" [attr.stroke]="getStrokeColor()" stroke-width="3" stroke-linejoin="round"/>
                } @else if (currentProductId === 'prod-cuadro-aluminio') {
                  <rect x="25" y="30" width="140" height="210" [attr.fill]="colorCode" [attr.stroke]="getStrokeColor()" stroke-width="3.5" rx="8" stroke-linejoin="round"/>
                  <rect x="35" y="40" width="120" height="190" fill="none" [attr.stroke]="getStrokeColor()" stroke-width="1" stroke-dasharray="4,4"/>
                } @else if (currentProductId === 'prod-pack-imanes') {
                  <rect x="25" y="60" width="135" height="135" [attr.fill]="colorCode" [attr.stroke]="getStrokeColor()" stroke-width="3.5" rx="10" stroke-linejoin="round"/>
                  <text x="92" y="180" [attr.fill]="getStrokeColor()" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle" opacity="0.4">FRENTE IMÁN</text>
                }  @else if (currentProductId === 'prod-body-bebe') {
                  <path d="M45,40 L125,40 L150,65 L130,95 L115,90 L115,190 C115,220 55,220 55,190 L55,90 L40,95 L20,65 Z" [attr.fill]="colorCode" [attr.stroke]="getStrokeColor()" stroke-width="2.5" stroke-linejoin="round"/>
                  <path d="M45,40 Q85,62 125,40" fill="none" [attr.stroke]="getStrokeColor()" stroke-width="2"/>
                  <circle cx="70" cy="205" r="2.5" [attr.fill]="getStrokeColor()"/><circle cx="85" cy="207" r="2.5" [attr.fill]="getStrokeColor()"/><circle cx="100" cy="205" r="2.5" [attr.fill]="getStrokeColor()"/>
                } @else {
                  <path d="M50,30 L110,30 L110,190 L135,215 L120,245 L80,220 L60,150 Z" [attr.fill]="colorCode" [attr.stroke]="getStrokeColor()" stroke-width="3" stroke-linejoin="round"/>
                }
              </g>
              <g transform="translate(320, 20)">
                @if (currentProductId === 'prod-polo-pima' || currentProductId === 'prod-polo-pique') {
                  <path d="M40,40 L160,40 L210,80 L180,120 L155,110 L155,240 L45,240 L45,110 L20,120 L-10,80 Z" [attr.fill]="colorCode" [attr.stroke]="getStrokeColor()" stroke-width="3" stroke-linejoin="round"/>
                  <path d="M40,40 Q100,48 160,40" fill="none" [attr.stroke]="getStrokeColor()" stroke-width="2.8"/>
                } @else if (currentProductId === 'prod-jean-urbano') {
                  <path d="M30,30 L150,30 L165,300 L115,300 L97,140 L79,300 L30,300 Z" [attr.fill]="colorCode" [attr.stroke]="getStrokeColor()" stroke-width="3" stroke-linejoin="round"/>
                  <path d="M45,60 L70,65 L70,95 L57,107 L45,95 Z" fill="none" [attr.stroke]="getStrokeColor()" stroke-width="2"/>
                  <path d="M110,60 L135,65 L135,95 L122,107 L110,95 Z" fill="none" [attr.stroke]="getStrokeColor()" stroke-width="2"/>
                } @else if (currentProductId === 'prod-short-fresco') {
                  <path d="M30,30 L150,30 L165,190 L115,190 L97,130 L79,190 L30,190 Z" [attr.fill]="colorCode" [attr.stroke]="getStrokeColor()" stroke-width="3" stroke-linejoin="round"/>
                  <path d="M45,60 L70,65 L70,95 L57,107 L45,95 Z" fill="none" [attr.stroke]="getStrokeColor()" stroke-width="2"/>
                  <path d="M110,60 L135,65 L135,95 L122,107 L110,95 Z" fill="none" [attr.stroke]="getStrokeColor()" stroke-width="2"/>
                }  @else if (currentProductId === 'prod-cuadro-aluminio') {
                  <rect x="25" y="30" width="140" height="210" [attr.fill]="colorCode" [attr.stroke]="getStrokeColor()" stroke-width="3.5" rx="8" stroke-linejoin="round"/>
                  <path d="M95,30 L115,150 L75,150 Z" [attr.fill]="getStrokeColor()" opacity="0.12"/>
                  <path d="M95,30 L115,150" [attr.stroke]="getStrokeColor()" stroke-width="3"/>
                } @else if (currentProductId === 'prod-pack-imanes') {
                  <rect x="25" y="60" width="135" height="135" fill="#fcfcfc" [attr.stroke]="getStrokeColor()" stroke-width="3.5" rx="10" stroke-linejoin="round"/>
                  <circle cx="92" cy="127" r="34" fill="#222222" opacity="0.85"/>
                  <text x="92" y="180" [attr.fill]="getStrokeColor()" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle" opacity="0.4">REVERSO IMANTADO</text>
                } @else if (currentProductId === 'prod-body-bebe') {
                  <path d="M45,40 L125,40 L150,65 L130,95 L115,90 L115,190 C115,220 55,220 55,190 L55,90 L40,95 L20,65 Z" [attr.fill]="colorCode" [attr.stroke]="getStrokeColor()" stroke-width="2.5" stroke-linejoin="round"/>
                  <path d="M45,40 Q85,46 125,40" fill="none" [attr.stroke]="getStrokeColor()" stroke-width="2"/>
                } @else {
                  <path d="M50,30 L110,30 L110,190 L135,215 L120,245 L80,220 L60,150 Z" [attr.fill]="colorCode" [attr.stroke]="getStrokeColor()" stroke-width="3" stroke-linejoin="round"/>
                }
              </g>
              <rect width="580" height="350" [attr.fill]="getShadowColor()" style="mix-blend-mode: overlay; pointer-events: none;"/>
            </svg>
          </div>

          <!-- CAPA 2: Canvas de Fabric -->
          <div class="absolute inset-0 z-20 overflow-hidden rounded-3xl" [style.pointerEvents]="isPanning ? 'none' : 'auto'">
            <canvas #mockupCanvas></canvas>
          </div>
      </div>
    </div>

    <!-- Botón de subida perfectamente encajado al pie -->
    <div class="w-full flex justify-center pt-3">
      <!-- AGREGADO NATIVO HTML: BOTÓN CON FLOTADO DINÁMICO SOBRE LA IMAGEN SELECCIONADA -->
      @if (showFloatingButton() && floatingBtnPos) {
        <button 
          (click)="processSelectedImageBg()"
          [style.left.px]="floatingBtnPos.x"
          [style.top.px]="floatingBtnPos.y"
          class="absolute bg-orange-600 hover:bg-orange-700 text-white font-black text-[9px] uppercase tracking-wider h-7 px-2.5 rounded-lg shadow-2xl z-50 flex items-center gap-1 transition-all transform active:scale-95 cursor-pointer border border-white">
          ✨Limpiar Fondo
        </button>
      }

      @if (showFloatingButton() && deleteBtnPos) {
        <button
          (click)="deleteSelectedLayer()"
          [style.left.px]="deleteBtnPos.x"
          [style.top.px]="deleteBtnPos.y"class="absolute bg-red-600 hover:bg-red-700 text-white font-black text-[9px] w-[60px] uppercase tracking-wider h-7 rounded-lg shadow-2xl z-50 flex items-center justify-center gap-1 transition-all transform active:scale-95 cursor-pointer border border-white">
          🗑️Borrar
        </button>
      }

      <label 
        [class.opacity-50]="isProcessingBg()"
        [class.pointer-events-none]="isProcessingBg()"
        class="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-black uppercase tracking-wider py-3.5 rounded-xl shadow-md cursor-pointer transition-all text-center block transform active:scale-95">    
        📸 Subir Logo o Imagen Extra
        <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)" />
      </label>

      <button 
          (click)="toggleCatalogModal(true)"
          class="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-black uppercase tracking-wider py-3.5 rounded-xl shadow-md cursor-pointer transition-all text-center block transform active:scale-95">
          🎨 Catálogo DTF en Stock
      </button>
    </div>

    @if (showCatalogModal()) {
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-[440px] rounded-3xl shadow-2xl flex flex-col max-h-[90%] border border-gray-100 overflow-hidden">
          <!-- Cabecera del Modal -->
          <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 class="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
              <span>🎨</span> Estampados Disponibles
            </h3>
            <button (click)="toggleCatalogModal(false)" class="text-gray-400 hover:text-gray-900 text-sm font-black w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200/60 transition-all cursor-pointer">✕</button>
          </div>

          <!-- Buscador Predictivo -->
          <div class="p-3 border-b border-gray-100 bg-white">
            <div class="relative">
              <input 
                type="text"
                [value]="searchTerm()"
                (input)="onSearchChange($event)"
                placeholder="🔎 Buscar diseño por palabra clave (Ej: goku)..."
                class="w-full bg-gray-50 border border-gray-200/80 rounded-xl py-2 pl-4 pr-4 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all" />
            </div>
          </div>

          <div class="flex items-center gap-1.5 px-3 py-2 border-b border-gray-50 bg-gray-50/30 overflow-x-auto shrink-0 touch-pan-x">
            @for (cat of dtfCategories(); track cat) {
              <button
                (click)="selectCategory(cat)"
                [ngClass]="getCategoryClasses(cat)">
                {{ cat }}
              </button>
            }
          </div>

          <!-- Área de Contenido con Scroll Vertical -->
          <div class="p-4 overflow-y-auto flex-1">
            @if (filteredDtfImages().length === 0) {
              <div class="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                <span class="text-2xl mb-1">🎨</span>
                <p class="text-xs font-black text-gray-900 uppercase tracking-wider">No se encontraron diseños</p>
                <p class="text-[10px] mt-0.5">Intenta con otra palabra o cambia de categoría</p>
              </div>
            } @else {
              <!-- 🌟 CONTENEDOR EN CUADRÍCULA OBLIGATORIO -->
              <div class="grid grid-cols-3 gap-3">
                @for (design of filteredDtfImages().slice(0, visibleCount()); track design.id) {
                  <div 
                    (click)="selectDtfFromStock(design.rutaWeb)"
                    class="group aspect-square bg-gray-50 rounded-2xl overflow-hidden border-2 border-transparent hover:border-orange-500 cursor-pointer transition-all p-1.5 flex flex-col items-center justify-center transform active:scale-95 shadow-sm relative">
                    <img [src]="design.rutaWeb" class="max-w-full max-h-[85%] object-contain group-hover:scale-105 transition-transform" [alt]="design.titulo" />
                    <div class="absolute bottom-1 left-1 right-1 text-[7px] font-black text-gray-400 text-center truncate uppercase tracking-wide bg-white/95 py-0.5 rounded-md">
                      {{ design.titulo }}
                    </div>
                  </div>
                }
              </div>

              <!-- Botón de Paginación Inteligente -->
              @if (filteredDtfImages().length > visibleCount()) {
                <div class="mt-4 text-center">
                  <button 
                    (click)="loadMoreDesigns()"
                    class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-[9px] font-black uppercase tracking-widest h-8 px-4 rounded-xl transition-all transform active:scale-95 cursor-pointer w-full">
                    🔄 Cargar Más Diseños ({{ filteredDtfImages().length - visibleCount() }} restantes)
                  </button>
                </div>
              }
            }
          </div>

        </div>
      </div>
    }
  `
})
export class CanvasViewerComponent implements AfterViewInit, OnChanges, OnInit {
  @ViewChild('mockupCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private bgService = inject(BackgroundRemovalService); 
  
  @Input() colorCode: string = '#ffffff'; 
  @Input() currentProductId: string = 'prod-polo-pima'; 
  @Input() customText: string = '';
  @Input() customFont: string = 'Impact';
  @Input() customTextColor: string = '#facc15';
  
  public zoomLevel = signal<number>(1.0);
  public removeBgChecked = signal(false);
  public isProcessingBg = signal(false);
  public showCatalogModal = signal<boolean>(false);

  // SIGNALS Y VARIABLES DE COORDENADAS PARA AMBOS BOTONES FLOTANTES TÁCTILES
  public dtfCategories = signal<string[]>(['Todos']);
  public allDtfDesigns = signal<DtfDesignItem[]>([]);
  public activeCategory = signal<string>('Todos');
  public searchTerm = signal<string>('');

  public visibleCount = signal<number>(15);
  public customerNotes = signal<string>('');
  
  public showFloatingButton = signal(false);
  public floatingBtnPos: { x: number, y: number } | null = null;
  public deleteBtnPos: { x: number, y: number } | null = null;

  public panOffset = { x: 0, y: 0 };
  public isPanning = false;
  private startX = 0;
  private startY = 0;

  public dtfStockImages = signal<string[]>([]);

  private isTouchDevice = false;

  private fabricCanvas!: fabric.Canvas;
  private fabricTextFrente: fabric.Text | null = null;
  private fabricTextEspalda: fabric.Text | null = null;  

  public miCelularPersonal: string = '51959087092'; 

  ngOnInit() {
    // Inicializa los modelos de fondo mientras el usuario interactúa con el mockup
    //this.bgService.preloadModels();
  }

  ngAfterViewInit() {
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.initCanvasEngine();

    this.loadCatalogMaestroData();

    if (this.isTouchDevice) {
      const containerWidth = this.canvasRef.nativeElement.parentElement?.clientWidth || window.innerWidth;
      const scaleFactor = (containerWidth - 16) / 580;
      document.documentElement.style.setProperty('--mobile-scale', scaleFactor.toString());
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.fabricCanvas) {
      if (changes['customText'] || changes['customFont'] || changes['customTextColor']) {
        this.syncTextLayers();
      }
      if (changes['currentProductId']) {
        this.fabricCanvas.clear();
        this.fabricTextFrente = null;
        this.fabricTextEspalda = null;
        this.syncTextLayers();
        this.showFloatingButton.set(false);
      }
    }
  }

  private initCanvasEngine() {
    const canvasElement = this.canvasRef.nativeElement;
    canvasElement.width = 580;
    canvasElement.height = 350;

    this.fabricCanvas = new fabric.Canvas(canvasElement, {
      width: 580,
      height: 350,
      preserveObjectStacking: true
    });

    this.syncTextLayers();
    this.setupCustomFabricControls();

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        this.deleteSelectedLayer();
      }
    });
  } 

  public getStrokeColor(): string {
    const c = this.colorCode;
    return (c === '#111111' || c === '#1d4ed8') ? 'rgba(255,255,255,0.45)' : 'rgba(17,17,17,0.22)';
  }

  public getShadowColor(): string {
    return (this.colorCode === '#111111' || this.colorCode === '#1d4ed8') ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  }

  /**
   * CÁLCULO DE POSICIONES EN TIEMPO REAL: Posiciona Limpiar Fondo a la izquierda y Eliminar a la derecha
   */
  private setupCustomFabricControls() {
    const updateButtonPositions = () => {
      const activeObject = this.fabricCanvas.getActiveObject();
      
      if (activeObject) {
        // 1. Obtener la caja de colisión real renderizada en el Viewport del Canvas
        const boundingRect = activeObject.getBoundingRect();
        
        // 2. Calcular el centro horizontal superior de la imagen seleccionada
        const topCenterY = boundingRect.top;
        const centerX = boundingRect.left + (boundingRect.width / 2);

        // 3. Botón ✨ Limpiar Fondo: Posicionado a la izquierda del centro
        this.floatingBtnPos = {
          x: centerX - 105, // Centrado perfecto hacia el lado izquierdo
          y: topCenterY - 68 // Flota exactamente 38 píxeles arriba del recuadro naranja
        };

        // 4. Botón 🗑️ Borrar: Posicionado a la derecha del centro
        this.deleteBtnPos = {
          x: centerX + 10,   // Centrado perfecto hacia el lado derecho
          y: topCenterY - 68 // Alineado a la misma altura horizontal
        };

        this.showFloatingButton.set(true);
      } else {
        this.showFloatingButton.set(false);
      }
    };

    // Escuchadores nativos de Fabric para refrescar las coordenadas en cada movimiento o re-escala
    this.fabricCanvas.on('selection:created', updateButtonPositions);
    this.fabricCanvas.on('selection:updated', updateButtonPositions);
    this.fabricCanvas.on('selection:cleared', () => this.showFloatingButton.set(false));
    
    this.fabricCanvas.on('object:moving', updateButtonPositions);
    this.fabricCanvas.on('object:scaling', updateButtonPositions);
  }

  /**
   * EVALUADOR DE CONTEXTO: Verifica si la capa es una imagen para renderizar el botón de la chispita
   */
  public isCurrentImageSelected(): boolean {
    const activeObject = this.fabricCanvas?.getActiveObject();
    return activeObject ? activeObject.type === 'image' : false;
  }

  /**
   * 🗑️ ACCIÓN DE BORRADO DE CAPA: Funciona de forma táctil nativa eliminando logos o cajas de texto
   */
  public deleteSelectedLayer() {
    const activeObj = this.fabricCanvas.getActiveObject();
    if (activeObj && !((activeObj as any).isEditing)) {
      this.fabricCanvas.remove(activeObj);
      this.showFloatingButton.set(false);
      this.fabricCanvas.renderAll();
    }
  }
  
  public async processSelectedImageBg() {
    const activeObject = this.fabricCanvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image' || this.isProcessingBg()) return;

    this.isProcessingBg.set(true);
    this.showFloatingButton.set(false);

    try {
      const fabricImage = activeObject as any; // Cast flexible para Fabric v6+
      const htmlImage = fabricImage.getElement() as HTMLImageElement;

      // 1. Dibujamos la imagen en un canvas temporal para extraer el Blob original
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = htmlImage.naturalWidth || htmlImage.width;
      canvas.height = htmlImage.naturalHeight || htmlImage.height;
      ctx.drawImage(htmlImage, 0, 0);

      const imageBlob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob((blob) => resolve(blob), 'image/png')
      );

      if (!imageBlob) throw new Error("No se pudo generar el Blob de la imagen");

      // 2. Llamamos a nuestra API a través del servicio actualizado
      const transparentBase64 = await this.bgService.removeBackgroundLocal(imageBlob);

      // 3. Creamos el objeto de imagen nativo del navegador con el resultado transparente
      const imgElement = new Image();
      imgElement.src = transparentBase64;

      imgElement.onload = () => {
        // Actualizamos los gráficos internos de Fabric v6+
        fabricImage.setElement(imgElement);

        // Recalculamos las dimensiones del recuadro de selección azul de Fabric
        fabricImage.set({
          width: imgElement.naturalWidth || imgElement.width,
          height: imgElement.naturalHeight || imgElement.height,
          imageSmoothing: true 
        });

        // Refrescamos todo el lienzo en pantalla
        this.fabricCanvas.renderAll();
        
        // Sincronizamos los eventos de UI con tus Signals
        (this.fabricCanvas as any).fire('selection:updated', { target: fabricImage });
        (this.fabricCanvas as any).fire('object:modified', { target: fabricImage });
      };

    } catch (err) {
      console.error("Error al procesar la remoción de fondo vía API:", err);
      alert("Ocurrió un error en el servidor al intentar limpiar el fondo de la imagen.");
    } finally {
      // Apagamos el estado de carga usando tus Angular Signals
      this.isProcessingBg.set(false);
    }
  }
  /*
  public async processSelectedImageBg() {
    const activeObject = this.fabricCanvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image' || this.isProcessingBg()) return;

    this.isProcessingBg.set(true);
    this.showFloatingButton.set(false);

    try {
      const fabricImage = activeObject as fabric.Image;
      const htmlImage = fabricImage.getElement() as HTMLImageElement;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = htmlImage.naturalWidth || htmlImage.width;
      canvas.height = htmlImage.naturalHeight || htmlImage.height;
      ctx.drawImage(htmlImage, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const whiteR = 255, whiteG = 255, whiteB = 255;
      const gridGrayR = 204, gridGrayG = 204, gridGrayB = 204;
      const tolerance = 45; 

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];     
        const g = data[i + 1]; 
        const b = data[i + 2]; 

        const distToWhite = Math.sqrt(Math.pow(r - whiteR, 2) + Math.pow(g - whiteG, 2) + Math.pow(b - whiteB, 2));
        const distToGray = Math.sqrt(Math.pow(r - gridGrayR, 2) + Math.pow(g - gridGrayG, 2) + Math.pow(b - gridGrayB, 2));

        if (distToWhite < tolerance || distToGray < tolerance) {
          data[i + 3] = 0; 
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const transparentDataUrl = canvas.toDataURL('image/png');

      await fabricImage.setSrc(transparentDataUrl);
      
      this.fabricCanvas.renderAll();
      this.fabricCanvas.fire('selection:created');

    } catch (err) {
      console.error("Error al limpiar el fondo por color en Canvas:", err);
    } finally {
      this.isProcessingBg.set(false);
    }
  } 
  */
  public onPanStart(event: MouseEvent) {
    if (this.zoomLevel() > 1.0 && !this.fabricCanvas.getActiveObject()) {
      this.isPanning = true;
      this.startX = event.clientX - this.panOffset.x;
      this.startY = event.clientY - this.panOffset.y;
    }
  }

  public onPanMove(event: MouseEvent) {
    if (this.isPanning) {
      this.panOffset.x = event.clientX - this.startX;
      this.panOffset.y = event.clientY - this.startY;
    }
  }

  public onTouchPanStart(event: TouchEvent) {
    if (this.zoomLevel() > 1.0 && !this.fabricCanvas.getActiveObject() && event.touches.length === 1) {
      this.isPanning = true;
      this.startX = event.touches[0].clientX - this.panOffset.x;
      this.startY = event.touches[0].clientY - this.panOffset.y;
    }
  }

  public onTouchPanMove(event: TouchEvent) {
    if (this.isPanning && event.touches.length === 1) {
      this.panOffset.x = event.touches[0].clientX - this.startX;
      this.panOffset.y = event.touches[0].clientY - this.startY;
    }
  }

  public onPanEnd() {
    this.isPanning = false;
  }

  public applyMultiLevelZoom(): void {
    if (this.zoomLevel() === 1.0) {
      this.zoomLevel.set(1.6); 
    } else if (this.zoomLevel() === 1.6) {
      this.zoomLevel.set(2.4); 
    } else {
      this.zoomLevel.set(1.0); 
      this.panOffset = { x: 0, y: 0 }; 
    }
  }

  public syncTextLayers() {
    if (!this.fabricCanvas) return;

    if (!this.customText.trim()) {
      if (this.fabricTextFrente) this.fabricCanvas.remove(this.fabricTextFrente);
      if (this.fabricTextEspalda) this.fabricCanvas.remove(this.fabricTextEspalda);
      this.fabricTextFrente = null;
      this.fabricTextEspalda = null;
      this.fabricCanvas.renderAll();
      return;
    }

    const textY = this.currentProductId.includes('jean') || this.currentProductId.includes('short') ? 110 : 130;
    const dynamicCornerSize = this.isTouchDevice ? 12 : 7;

    if (!this.fabricTextFrente) {
      this.fabricTextFrente = new fabric.Text(this.customText.toUpperCase(), {
        left: 140, top: textY, fontFamily: this.customFont, fill: this.customTextColor, fontSize: 20, fontWeight: 'bold', originX: 'center', originY: 'center', cornerColor: '#ff5a00', cornerSize: dynamicCornerSize, transparentCorners: false
      });
      this.fabricCanvas.add(this.fabricTextFrente);
    } else {
      this.fabricTextFrente.set({ text: this.customText.toUpperCase(), fontFamily: this.customFont, fill: this.customTextColor });
    }

    if (!this.fabricTextEspalda) {
      this.fabricTextEspalda = new fabric.Text(this.customText.toUpperCase(), {
        left: 420, top: textY, fontFamily: this.customFont, fill: this.customTextColor, fontSize: 20, fontWeight: 'bold', originX: 'center', originY: 'center', cornerColor: '#ff5a00', cornerSize: dynamicCornerSize, transparentCorners: false
      });
      this.fabricCanvas.add(this.fabricTextEspalda);
    } else {
      this.fabricTextEspalda.set({ text: this.customText.toUpperCase(), fontFamily: this.customFont, fill: this.customTextColor });
    }

    this.fabricCanvas.renderAll();
  }

  public addFloatingTextLayer() {
    if (!this.fabricCanvas) return;
    const dynamicCornerSize = this.isTouchDevice ? 13 : 8;

    const editableText = new fabric.IText('TEXTO', {
      left: 290, top: 150, fontFamily: 'Impact', fill: '#facc15', fontSize: 24, fontWeight: 'bold', originX: 'center', originY: 'center', cornerColor: '#ff5a00', cornerSize: dynamicCornerSize, transparentCorners: false, hasControls: true, hasBorders: true
    });
    this.fabricCanvas.add(editableText);
    this.fabricCanvas.setActiveObject(editableText);
    this.fabricCanvas.renderAll();
  }

  public changeSelectedTextColor(colorCode: string) {
    if (!this.fabricCanvas) return;
    const activeObject = this.fabricCanvas.getActiveObject();
    if (activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text')) {
      activeObject.set({ fill: colorCode });
      this.fabricCanvas.renderAll();
    }
  }

  public changeSelectedTextFont(fontName: string) {
    if (!this.fabricCanvas) return;
    const activeObject = this.fabricCanvas.getActiveObject();
    if (activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text')) {
      activeObject.set({ fontFamily: fontName });
      this.fabricCanvas.renderAll();
    }
  }

  public onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files;
      const reader = new FileReader();
      reader.onload = (e) => {
        fabric.Image.fromURL(e.target?.result as string).then((img) => {
          const dynamicCornerSize = this.isTouchDevice ? 12 : 7;
          img.set({left: 140, top: 150, originX: 'center', originY: 'center', cornerColor: '#ff5a00', cornerSize: dynamicCornerSize, transparentCorners: false, hasControls: true, hasBorders: true});
          img.scaleToWidth(75);
          this.fabricCanvas.add(img);
          this.fabricCanvas.setActiveObject(img);
          img.setCoords();
          this.fabricCanvas.renderAll();
        }).catch(err => console.error(err));
      };
      reader.readAsDataURL(file[0]);
    }
  }

  public filteredDtfImages = computed(() => {
    const designs = this.allDtfDesigns();
    const category = this.activeCategory();
    const query = this.searchTerm().toLowerCase().trim();

    return designs.filter(design => {
      const matchesCategory = (category === 'Todos') || (design.categoria === category);
      const matchesSearch = !query || design.titulo.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  });

  public async loadCatalogMaestroData() {
    try {
      const baseAppUrl = window.location.origin;
      const response = await fetch(`${baseAppUrl}/assets/catalogo-maestro.json`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.dtfConfig) {
          this.dtfCategories.set(data.dtfConfig.categorias || ['Todos']);
          this.allDtfDesigns.set(data.dtfConfig.disenos || []);
        }
      }
    } catch (err) {
      console.error("Error leyendo catálogo indexado en Angular:", err);
    }
  }

  public toggleCatalogModal(isOpen: boolean) {
    this.showCatalogModal.set(isOpen);
    if (isOpen) {
      // 🌟 Al abrir el modal, reiniciamos los filtros y la paginación a su estado inicial
      this.searchTerm.set('');
      this.activeCategory.set('Todos');
      this.visibleCount.set(15);
      this.loadCatalogMaestroData();
    }
  }

  public onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.visibleCount.set(15); // Reiniciar paginación al buscar
  }

  public selectCategory(categoryName: string) {
    this.activeCategory.set(categoryName);
    this.visibleCount.set(15); // Reiniciar paginación al cambiar de pestaña
  }

  public loadMoreDesigns() {
    this.visibleCount.update(count => count + 15);
  }

  public selectDtfFromStock(imagePath: string) {
    this.toggleCatalogModal(false);

    fabric.Image.fromURL(imagePath).then((img) => {
      const dynamicCornerSize = this.isTouchDevice ? 12 : 7;
      img.set({ 
        left: 140, top: 150, originX: 'center', originY: 'center',
        cornerColor: '#ff5a00', cornerSize: dynamicCornerSize, transparentCorners: false,
        hasControls: true, hasBorders: true
      });
      img.scaleToWidth(75);
      
      this.fabricCanvas.add(img);
      this.fabricCanvas.setActiveObject(img);
      img.setCoords(); 
      this.fabricCanvas.renderAll();
    }).catch(err => console.error("Error al inyectar diseño de stock:", err));
  }

  public getCategoryClasses(categoryName: string): string {
    const baseClasses = "shrink-0 text-[10px] font-black uppercase tracking-wider px-3 h-7 rounded-lg border transition-all cursor-pointer transform active:scale-95";
    
    if (this.activeCategory() === categoryName) {
      return `${baseClasses} bg-orange-600 text-white border-orange-600`;
    } else {
      return `${baseClasses} bg-white text-gray-600 border-gray-200/60 hover:border-gray-400`;
    }
  }

  // 2. Agrega este método al final de tu componente, antes de la última llave de cierre:
  /**
   * 📸 EXPORTADOR PROFESIONAL DE MOCKUP UNIFICADO CON OBSERVACIONES
   * Fusiona los vectores del producto, el lienzo de Fabric y las notas en un PNG descargable
  */

  public async exportFullMockupWithNotes(notes: string) {
    try {
      const baseWidth = 580;
      const baseHeight = 350;
      const footerHeight = 60;

      // 1. Crear el Canvas maestro secundario en memoria libre de bloqueos
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = baseWidth;
      exportCanvas.height = baseHeight + footerHeight;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return;

      // 2. Pintar fondo blanco base para el archivo final
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      // 3. 🌟 DIBUJAR LAS SILUETAS DE LAS PRENDAS DIRECTAMENTE POR COORDENADAS
      // Esto clona de manera exacta tus SVG nativos sin tocar el DOM, garantizando que el polo salga dibujado con su color real
      ctx.save();
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.fillStyle = this.colorCode || '#ffffff';
      ctx.strokeStyle = this.colorCode === '#111111' ? 'rgba(255,255,255,0.45)' : 'rgba(17,17,17,0.22)';

      // --- SILUETA 1: FRENTE ---
      ctx.translate(40, 20);
      if (this.currentProductId === 'prod-polo-pima' || this.currentProductId === 'prod-polo-pique') {
        ctx.beginPath();
        ctx.moveTo(40, 40); ctx.lineTo(160, 40); ctx.lineTo(210, 80); ctx.lineTo(180, 120);
        ctx.lineTo(155, 110); ctx.lineTo(155, 240); ctx.lineTo(45, 240); ctx.lineTo(45, 110);
        ctx.lineTo(20, 120); ctx.lineTo(-10, 80); ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.beginPath(); ctx.lineWidth = 2.8; ctx.arc(100, -32, 75, 0.45 * Math.PI, 0.55 * Math.PI); ctx.stroke();
        if (this.currentProductId === 'prod-polo-pique') {
          ctx.beginPath(); ctx.lineWidth = 2.5; ctx.moveTo(40, 40); ctx.lineTo(100, 75); ctx.lineTo(160, 40); ctx.stroke();
          ctx.beginPath(); ctx.lineWidth = 2; ctx.moveTo(100, 75); ctx.lineTo(100, 118); ctx.stroke();
        }
      } 
      // 🌟 AGREGADO: Condicional específica para dibujar de forma limpia tus calcetines/medias largas
      else if (this.currentProductId.includes('medias')) {
        ctx.beginPath();
        // Trazo nativo de la bota/tubo y el talón de la media larga
        ctx.moveTo(50, 30); ctx.lineTo(110, 30); ctx.lineTo(110, 190); ctx.lineTo(135, 215);
        ctx.lineTo(120, 245); ctx.lineTo(80, 220); ctx.lineTo(60, 150); ctx.closePath();
        ctx.fill(); ctx.stroke();
      } 
      else if (this.currentProductId === 'prod-cuadro-aluminio') {
        ctx.beginPath(); ctx.roundRect(25, 30, 140, 210, 8); ctx.fill(); ctx.stroke();
      } else if (this.currentProductId === 'prod-pack-imanes') {
        ctx.beginPath(); ctx.roundRect(25, 60, 135, 135, 10); ctx.fill(); ctx.stroke();
      }

      // --- SILUETA 2: ESPALDA ---
      ctx.restore();
      ctx.save();
      ctx.lineWidth = 3; ctx.lineJoin = 'round';
      ctx.fillStyle = this.colorCode || '#ffffff';
      ctx.strokeStyle = this.colorCode === '#111111' ? 'rgba(255,255,255,0.45)' : 'rgba(17,17,17,0.22)';
      
      ctx.translate(320, 20);
      if (this.currentProductId === 'prod-polo-pima' || this.currentProductId === 'prod-polo-pique') {
        ctx.beginPath();
        ctx.moveTo(40, 40); ctx.lineTo(160, 40); ctx.lineTo(210, 80); ctx.lineTo(180, 120);
        ctx.lineTo(155, 110); ctx.lineTo(155, 240); ctx.lineTo(45, 240); ctx.lineTo(45, 110);
        ctx.lineTo(20, 120); ctx.lineTo(-10, 80); ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.beginPath(); ctx.lineWidth = 2.8; ctx.arc(100, 2, 60, 1.36 * Math.PI, 1.64 * Math.PI); ctx.stroke();
      } 
      // 🌟 AGREGADO: Clona de forma simétrica la segunda media de tu catálogo
      else if (this.currentProductId.includes('medias')) {
        ctx.beginPath();
        ctx.moveTo(50, 30); ctx.lineTo(110, 30); ctx.lineTo(110, 190); ctx.lineTo(135, 215);
        ctx.lineTo(120, 245); ctx.lineTo(80, 220); ctx.lineTo(60, 150); ctx.closePath();
        ctx.fill(); ctx.stroke();
      } 
      else {
        ctx.fillStyle = '#fcfcfc';
        ctx.beginPath(); ctx.roundRect(25, 60, 135, 135, 10); ctx.fill(); ctx.stroke();
      }
      ctx.restore();

      // 4. Estampar la capa del sombreado realista (Efecto Overlay del SVG)
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = this.getShadowColor();
      ctx.fillRect(0, 0, baseWidth, baseHeight);
      ctx.restore();

      // 5. Extraer y fusionar encima las capas de los logos de Fabric v6
      const fabricDataUrl = this.fabricCanvas.toDataURL({ format: 'png', multiplier: 1 });
      const fabricImage = new Image();
      fabricImage.src = fabricDataUrl;
      await new Promise((resolve) => (fabricImage.onload = resolve));
      ctx.drawImage(fabricImage, 0, 0, baseWidth, baseHeight);

      // 6. Dibujar la franja inferior estática para las observaciones del pedido
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(0, baseHeight, baseWidth, footerHeight);
      
      ctx.lineWidth = 1; ctx.strokeStyle = '#e5e7eb';
      ctx.beginPath(); ctx.moveTo(0, baseHeight); ctx.lineTo(baseWidth, baseHeight); ctx.stroke();

      // 7. Escribir las cabeceras y el texto de la anotación
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('📝 OBSERVACIONES DE PERSONALIZACIÓN:', 20, baseHeight + 22);

      ctx.fillStyle = '#4b5563';
      ctx.font = 'medium 11px sans-serif';
      const notaTexto = notes.trim() || 'Ninguna especificada por el cliente.';
      
      if (notaTexto.length > 75) {
        ctx.fillText(notaTexto.substring(0, 75) + '...', 20, baseHeight + 42);
      } else {
        ctx.fillText(notaTexto, 20, baseHeight + 42);
      }

      // 8. Disparar la descarga limpia y directa del PNG unificado
      const finalDataUrl = exportCanvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `mockup-${this.currentProductId}-${Date.now()}.png`;
      downloadLink.href = finalDataUrl;
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

    } catch (err) {
      console.error("Error al exportar el mockup completo con siluetas:", err);
    }
  }

  /**
   * 🚀 MOTOR DE COMPRA DIRECTA POR WHATSAPP (100% LOCAL SIN BACKEND)
   * Captura los datos del producto, color, genera la descarga y abre tu WhatsApp personal
  */
  public enviarPedidoWhatsApp(notesFromParent: string, size: string) {
    // 1. Gatillar la descarga del mockup final
    this.exportFullMockupWithNotes(notesFromParent);

    // 2. Extraer los datos técnicos del componente
    const productoActual = this.currentProductId || 'Producto Personalizado';
    const colorActual = this.colorCode || 'No especificado';
    const notasLimpias = notesFromParent.trim() || 'Ninguna.';
    const tallaActual = size.trim() || 'Ninguna.';    
    

    // 3. 🌟 SOLUCIÓN DEFINITIVA: Una sola plantilla de comillas invertidas (Backticks) limpia sin usar el signo "+"
    // Esto obliga al navegador a reemplazar las variables dinámicas de forma matemática e infalible
    const mensajeFormateado = `¡Hola! 👋 Deseo confirmar el siguiente pedido de personalización:

    📦 *PRODUCTO:* ${productoActual}
    🎨 *COLOR BASE:* ${colorActual}
    📏 *TALLA:* ${tallaActual}
    📝 *OBSERVACIONES:* ${notasLimpias}

    📌 _Acabo de descargar el mockup oficial. Lo adjunto a continuación de este mensaje para el taller._`;

    // 4. Codificar correctamente el mensaje para que los espacios y emojis viajen seguros por internet
    const mensajeCodificado = encodeURIComponent(mensajeFormateado);

    // 5. 🌟 CORRECCIÓN CRÍTICA DE LA URL: Enlazado limpio e incuestionable para el navegador
    const urlWhatsApp = "https://wa.me/" + this.miCelularPersonal + "?text=" + mensajeCodificado;

    // 6. Redirección instantánea hacia tu chat personal
    window.open(urlWhatsApp, '_blank');
  }
}