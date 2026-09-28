import { removeBackground } from '@imgly/background-removal-node';

export default async function handler(req, res) {
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

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const imageBlobInput = new Blob([bytes], { type: 'image/png' });

    // 🔥 CONFIGURACIÓN FINAL: Forzamos a la IA a descargar los JSON y modelos desde internet de forma segura
    const processedBlob = await removeBackground(imageBlobInput, {
      model: 'small',
      publicPath: 'https://staticimgly.com', // 👈 Apunta al CDN oficial de la librería
      output: {
        format: 'image/png',
        quality: 0.95
      }
    });

    const arrayBuffer = await processedBlob.arrayBuffer();
    const outputBytes = new Uint8Array(arrayBuffer);
    let outputBinary = '';
    for (let i = 0; i < outputBytes.length; i++) {
      outputBinary += String.fromCharCode(outputBytes[i]);
    }
    const outputBase64 = btoa(outputBinary);
    
    return res.status(200).json({ image: `data:image/png;base64,${outputBase64}` });

  } catch (error) {
    console.error("Error en Vercel Serverless:", error);
    return res.status(500).json({ error: 'Error procesando la remoción de fondo', details: error.message });
  }
}