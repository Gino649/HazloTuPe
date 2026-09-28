import type { VercelRequest, VercelResponse } from '@vercel/node';
import { removeBackground } from '@imgly/background-removal-node';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { pathToFileURL } from 'url';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CONTROL DE CORS Y PETICIONES PREVIAS (OPTIONS)
  // El navegador a veces envía un OPTIONS antes del POST real. Si no respondes 200, te clava un 405.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. FORZAR CONTROL ESTRICTO DE MÉTODOS
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST' });
  }

  const tempDirectory = os.tmpdir();
  const tempPath = path.join(tempDirectory, `img_${Date.now()}.png`);

  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    fs.writeFileSync(tempPath, base64Data, 'base64');

    const fileUrlString = pathToFileURL(tempPath).href;

    const processedBlob = await removeBackground(fileUrlString, {
      model: 'small',
      output: {
        format: 'image/png',
        quality: 0.95
      }
    });

    const arrayBuffer = await processedBlob.arrayBuffer();
    const outputBase64 = Buffer.from(arrayBuffer).toString('base64');
    
    return res.status(200).json({ image: `data:image/png;base64,${outputBase64}` });

  } catch (error: any) {
    console.error("Error en Vercel Serverless:", error);
    return res.status(500).json({ error: 'Error procesando la remoción de fondo', details: error.message });
  } finally {
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {
        console.error("No se pudo borrar el archivo temporal:", e);
      }
    }
  }
}