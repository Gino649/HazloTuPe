const fs = require('fs');
const path = require('path');

// 1. Ruta base real de tus recursos
const raizProyecto = __dirname;
const rutaAssets = path.join(raizProyecto, 'public', 'assets');

// 2. Objeto maestro final que leerá tu Angular
const catalogoMaestro = {
  // Secciones estáticas de productos base
  bebe: [],
  imanes: [],
  laminas: [],
  medias: [],
  pique: [],
  polos: [],
  jean:[],
  shorts:[],
  promociones:[],
  // 🌟 Módulo masivo para diseños de estampados DTF
  dtfConfig: {
    categorias: ['Todos'],
    disenos: []
  }
};

// Función auxiliar clásica para escanear archivos planos en una carpeta
function escanearCarpetaEstatica(clave, rutaAbsoluta, rutaRelativaWeb) {
  if (!fs.existsSync(rutaAbsoluta)) return;
  try {
    const archivos = fs.readdirSync(rutaAbsoluta);
    const imagenes = archivos.filter(file => {
      const min = file.toLowerCase();
      return min.endsWith('.png') || min.endsWith('.avif') || min.endsWith('.jpg') || min.endsWith('.jpeg') || min.endsWith('.webp');
    });
    catalogoMaestro[clave] = imagenes.map(img => `${rutaRelativaWeb}/${img}`);
  } catch (err) {
    catalogoMaestro[clave] = [];
  }
}

// 3. Escanear tus carpetas de productos tal como están en tu disco duro
escanearCarpetaEstatica('bebe', path.join(rutaAssets, 'productos', 'bebe'), 'assets/productos/bebe');
escanearCarpetaEstatica('imanes', path.join(rutaAssets, 'productos', 'Imanes'), 'assets/productos/Imanes');
escanearCarpetaEstatica('laminas', path.join(rutaAssets, 'productos', 'laminas'), 'assets/productos/laminas');
escanearCarpetaEstatica('medias', path.join(rutaAssets, 'productos', 'medias'), 'assets/productos/medias');
escanearCarpetaEstatica('pique', path.join(rutaAssets, 'productos', 'pique'), 'assets/productos/pique');
escanearCarpetaEstatica('polos', path.join(rutaAssets, 'productos', 'polos'), 'assets/productos/polos');
escanearCarpetaEstatica('jean', path.join(rutaAssets, 'productos', 'jean'), 'assets/productos/jean');
escanearCarpetaEstatica('shorts', path.join(rutaAssets, 'productos', 'shorts'), 'assets/productos/shorts');
escanearCarpetaEstatica('promociones', path.join(rutaAssets, 'productos', 'promociones'), 'assets/productos/promociones');

// 4. 🌟 ESCANEO MASIVO E INTELIGENTE PARA LA CARPETA DTF
const rutaDtf = path.join(rutaAssets, 'dtf');
if (fs.existsSync(rutaDtf)) {
  try {
    const elementos = fs.readdirSync(rutaDtf);

    elementos.forEach(elemento => {
      const rutaElemento = path.join(rutaDtf, elemento);
      const esCarpeta = fs.statSync(rutaElemento).isDirectory();

      if (esCarpeta) {
        // Encontró una subcarpeta temática (Ej: Anime, Retro, Bandas) -> Crear pestaña
        catalogoMaestro.dtfConfig.categorias.push(elemento);

        const archivosInternos = fs.readdirSync(rutaElemento);
        const imagenes = archivosInternos.filter(file => {
          const min = file.toLowerCase();
          return min.endsWith('.png') || min.endsWith('.avif') || min.endsWith('.jpg') || min.endsWith('.jpeg') || min.endsWith('.webp');
        });

        imagenes.forEach(img => {
          catalogoMaestro.dtfConfig.disenos.push({
            id: `${elemento}_${img}`,
            titulo: img.replace(/\.[^/.]+\$/, "").replace(/[-_]/g, " "), // Convierte "goku-ultra" a "goku ultra" para el buscador
            rutaWeb: `assets/dtf/${elemento}/${img}`,
            categoria: elemento
          });
        });
      } else {
        // Si hay imágenes sueltas directo en la raíz de dtf/ van a la pestaña General
        const min = elemento.toLowerCase();
        if (min.endsWith('.png') || min.endsWith('.jpg') || min.endsWith('.jpeg') || min.endsWith('.webp')) {
          catalogoMaestro.dtfConfig.disenos.push({
            id: `general_${elemento}`,
            titulo: elemento.replace(/\.[^/.]+\$/, "").replace(/[-_]/g, " "),
            rutaWeb: `assets/dtf/${elemento}`,
            categoria: 'General'
          });
        }
      }
    });

    // Añadir pestaña General solo si existen elementos huérfanos
    if (catalogoMaestro.dtfConfig.disenos.some(d => d.categoria === 'General')) {
      catalogoMaestro.dtfConfig.categorias.push('General');
    }

  } catch (err) {
    console.error("Error procesando subcarpetas de dtf:", err.message);
  }
}

// 5. Guardar el JSON consolidado en public/assets/
const rutaDestinoJson = path.join(rutaAssets, 'catalogo-maestro.json');
fs.writeFileSync(rutaDestinoJson, JSON.stringify(catalogoMaestro, null, 2));

console.log(`✅ Catálogo indexado completo para Vercel. ${catalogoMaestro.dtfConfig.disenos.length} estampados listos.`);