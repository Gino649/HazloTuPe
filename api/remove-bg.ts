import { removeBackground } from '@imgly/background-removal-node';

export default async function handler(req: any, res: any) {
  // Control previo de cabeceras CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST' });
  }

  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }

    // 1. Limpiamos el prefijo de metadatos del Base64
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    
    // 2. Convertimos el Base64 en un arreglo de bytes binarios (Uint8Array) nativo de JavaScript
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 3. Creamos un Blob directamente en la memoria RAM del servidor de Vercel
    const imageBlobInput = new Blob([bytes], { type: 'image/png' });

    // 4. La IA procesa el Blob en la memoria de forma óptima
    const processedBlob = await removeBackground(imageBlobInput, {
      model: 'small',
      output: {
        format: 'image/png',
        quality: 0.95
      }
    });

    // 5. Convertimos el Blob transparente resultante de vuelta a Base64 usando operaciones de memoria nativas
    const arrayBuffer = await processedBlob.arrayBuffer();
    const outputBytes = new Uint8Array(arrayBuffer);
    let outputBinary = '';
    for (let i = 0; i < outputBytes.length; i++) {
      outputBinary += String.fromCharCode(outputBytes[i]);
    }
    const outputBase64 = btoa(outputBinary);
    
    return res.status(200).json({ image: `data:image/png;base64,${outputBase64}` });

  } catch (error: any) {
    console.error("Error en Vercel Serverless:", error);
    return res.status(500).json({ error: 'Error procesando la remoción de fondo', details: error.message });
  }
}