export const config = {
  runtime: 'edge',
};

export default async function handler(req: any) {
  // En las Edge Functions, las peticiones usan el estándar nativo Request/Response de la Web
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200 });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido. Usa POST' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'No se recibió ninguna imagen' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Importamos la librería de forma dinámica compatible con el entorno Edge
    const imglyModule: any = await import('@imgly/background-removal-node');
    const removeBackground = imglyModule.removeBackground;

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    
    // Decodificación de Base64 optimizada para entornos Edge estándar
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const imageBlobInput = new Blob([bytes], { type: 'image/png' });

    // La IA procesa el Blob directo en la memoria global optimizada
    const processedBlob = await removeBackground(imageBlobInput, {
      model: 'small',
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
    
    return new Response(JSON.stringify({ image: `data:image/png;base64,${outputBase64}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Error en Vercel Edge Function:", error);
    return new Response(JSON.stringify({ error: 'Error procesando la remoción de fondo', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}