# Santiago Inteligente 🇨🇱

> Para turistas que visitan Santiago y se abruman eligiendo entre demasiadas opciones, Santiago Inteligente entrega en tres pasos una ruta de actividades ajustada al tiempo y al presupuesto que quieren destinar.

## 👥 Integrantes

* **Francisco Carrera** - [@Sxnr](https://github.com/Sxnr)
* **Francisco Carvajal** - [@Sn1k-12](https://github.com/Sn1k-12)
* **Gerzon Toro** - [@gerzontoro](https://github.com/gerzontoro)

## 🔗 Enlace al prototipo web

> [https://santiago-inteligente.vercel.app](#) *(Placeholder - Reemplazar con URL deployada en Vercel/Netlify)*

> Alternativa local: `npm run dev` → http://localhost:5173

## 📄 Enlace a los documentos

> [https://drive.google.com/drive/folders/santiago-inteligente-docs](#) *(Placeholder - Reemplazar con enlace a Drive/Notion con propuesta comercial, láminas y arquitectura)*

> Documentos incluidos:
> - Propuesta Comercial (`docs/hito-1/propuesta.pdf`)
> - Láminas de Presentación (`docs/hito-1/presentacion.pdf`)
> - Diagrama de Arquitectura (`docs/hito-1/arquitectura.png`)

---

## ⚙️ Instalación y Ejecución

### Prerrequisitos
* Node.js v18+
* npm v9+

### Pasos
```bash
# 1. Clonar repositorio
git clone https://github.com/Sxnr/Santiago-Inteligente.git
cd Santiago-Inteligente

# 2. Instalar dependencias
npm install

# 3. Ejecutar en desarrollo
npm run dev

# 4. Build producción
npm run build
npm run preview
```

### Stack
* Vite + React 18
* Tailwind CSS 3.4
* Framer Motion 11

## 📱 Prototipo - 3 Pantallas Navegables

1. **Dashboard Principal (Home)** - Header, búsqueda, filtros, Rutas Populares (click → Detalle), CTA Planifica tu ruta
2. **Generador de Rutas** - Slider tiempo (1-8h), presupuesto CLP, toggles categorías, Generar Ruta (loading 1s → Detalle)
3. **Detalle POI/Ruta** - Header imagen, horario/precio, cupón 20% con contador, mapa simulado, guía virtual audio

Navegación por estado React (`useState`) sin React Router, contenida en `max-w-md mx-auto h-screen shadow-xl` para simular app nativa.

## 🎨 Datos Mockeados

Lugares reales: Plaza de Armas, Palacio La Moneda, Cerro San Cristóbal, La Chascona, Bellas Artes, Parque Forestal, Cerro Santa Lucía, Mercado Central. Precios en CLP y horarios reales chilenos.

