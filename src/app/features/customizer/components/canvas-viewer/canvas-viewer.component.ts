import { Component, ElementRef, Input, ViewChild, AfterViewInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as fabric from 'fabric'; 
import { removeBackground } from '@imgly/background-removal';

declare global {
  interface Window {
    ort: any;
  }
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
        <div class="absolute bottom-4 left-4 right-4 md:right-auto bg-orange-600 text-white text-[8px] font-black px-2 py-2 rounded-md uppercase tracking-wider z-30 shadow-sm animate-pulse text-center md:text-left">
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

      <!-- 🌟 CONTENEDOR MÁSTIL: Mantiene las dimensiones fijas y centra el lienzo interno usando Flexbox -->
      <div class="w-full aspect-[29/19] md:w-[580px] md:h-[380px] relative overflow-hidden rounded-2xl bg-gray-50/50 flex items-center justify-center">
        
        <!-- El lienzo interno mide exactamente 580x380 y se escala simétricamente -->
        <div class="w-[580px] h-[380px] relative transition-transform duration-300 ease-out origin-center shrink-0"
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
            <svg xmlns="http://w3.org" width="580" height="380" viewBox="0 0 580 380" class="w-full h-full">
              
              <!-- COLUMNA 1: SILUETA DEL FRENTE -->
              <g transform="translate(40, 20)">
                @if (currentProductId === 'prod-polo-pima' || currentProductId === 'prod-polo-pique') {
                  <path d="M40,40 L160,40 L210,80 L180,120 L155,110 L155,270 L45,270 L45,110 L20,120 L-10,80 Z" [attr.fill]="colorCode" [attr.stroke]="getStrokeColor()" stroke-width="3" stroke-linejoin="round"/>
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

              <!-- COLUMNA 2: SILUETA DE LA ESPALDA -->
              <g transform="translate(320, 20)">
                @if (currentProductId === 'prod-polo-pima' || currentProductId === 'prod-polo-pique') {
                  <path d="M40,40 L160,40 L210,80 L180,120 L155,110 L155,270 L45,270 L45,110 L20,120 L-10,80 Z" [attr.fill]="colorCode" [attr.stroke]="getStrokeColor()" stroke-width="3" stroke-linejoin="round"/>
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
              <rect width="580" height="380" [attr.fill]="getShadowColor()" style="mix-blend-mode: overlay; pointer-events: none;"/>
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
      <label 
        [class.opacity-50]="isProcessingBg()"
        [class.pointer-events-none]="isProcessingBg()"
        class="w-full bg-gray-900 hover:bg-orange-600 text-white text-[11px] font-black uppercase tracking-wider py-3.5 rounded-xl shadow-md cursor-pointer transition-all text-center block transform active:scale-95 z-30">    
        📸 Subir Logo o Imagen Extra
        <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)" />
      </label>
    </div>
  `
})
export class CanvasViewerComponent implements AfterViewInit, OnChanges {
  @ViewChild('mockupCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  @Input() colorCode: string = '#ffffff'; 
  @Input() currentProductId: string = 'prod-polo-pima'; 
  @Input() customText: string = '';
  @Input() customFont: string = 'Impact';
  @Input() customTextColor: string = '#facc15';
  
  public zoomLevel = signal<number>(1.0);
  public removeBgChecked = signal(false);
  public isProcessingBg = signal(false);

  public showFloatingButton = signal(false);
  public floatingBtnPos: { x: number, y: number } | null = null;

  public panOffset = { x: 0, y: 0 };
  public isPanning = false;
  private startX = 0;
  private startY = 0;

  private isTouchDevice = false;

  private fabricCanvas!: fabric.Canvas;
  private fabricTextFrente: fabric.Text | null = null;
  private fabricTextEspalda: fabric.Text | null = null;

  ngAfterViewInit() {
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.initCanvasEngine();
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
    canvasElement.height = 380;

    this.fabricCanvas = new fabric.Canvas(canvasElement, {
      width: 580,
      height: 380,
      preserveObjectStacking: true
    });

    this.syncTextLayers();
    this.setupCustomFabricControls();

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObj = this.fabricCanvas.getActiveObject();
        if (activeObj && !((activeObj as any).isEditing)) {
          this.fabricCanvas.remove(activeObj);
          this.showFloatingButton.set(false);
          this.fabricCanvas.renderAll();
        }
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

  private setupCustomFabricControls() {
    const updateButtonPosition = () => {
      const activeObject = this.fabricCanvas.getActiveObject();
      if (activeObject && activeObject.type === 'image') {
        const boundingRect = activeObject.getBoundingRect();
        this.floatingBtnPos = {
          x: boundingRect.left - 5,
          y: boundingRect.top - 36
        };
        this.showFloatingButton.set(true);
      } else {
        this.showFloatingButton.set(false);
      }
    };

    this.fabricCanvas.on('selection:created', updateButtonPosition);
    this.fabricCanvas.on('selection:updated', updateButtonPosition);
    this.fabricCanvas.on('selection:cleared', () => this.showFloatingButton.set(false));
    this.fabricCanvas.on('object:moving', updateButtonPosition);
    this.fabricCanvas.on('object:scaling', updateButtonPosition);
  }
  
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
      console.error("Error al limpiar el fondo en Canvas:", err);
    } finally {
      this.isProcessingBg.set(false);
    }
  }

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
          const dynamicCornerSize = this.isTouchDevice ? 12 : 7;img.set({
            left: 140, top: 150, originX: 'center', originY: 'center', cornerColor: '#ff5a00', cornerSize: dynamicCornerSize, transparentCorners: false, hasControls: true, hasBorders: true
          });
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
}