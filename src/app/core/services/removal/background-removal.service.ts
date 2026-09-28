import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackgroundRemovalService {

  async removeBackgroundLocal(imageBlob: Blob): Promise<string> {
    const base64String = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      // readAsDataURL genera el prefijo idóneo automáticamente
      reader.onloadend = () => resolve(reader.result as string); 
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(imageBlob);
    });

    const response = await fetch('/api/remove-bg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64String })
    });

    if (!response.ok) throw new Error("Error en el servidor");
    const data = await response.json();
    return data.image; 
  }
}