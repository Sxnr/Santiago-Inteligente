# Santiago Inteligente 🇨🇱

> Para el turista en Santiago con tiempo y presupuesto acotados, Santiago Inteligente genera rutas viables en segundos descartando lo impagable.

## 👥 Integrantes

* **Francisco Carrera** - [@Sxnr](https://github.com/Sxnr)
* **Francisco Carvajal** - [@Sn1k-12](https://github.com/Sn1k-12)
* **Gerzon Toro** - [@gerzontoro](https://github.com/gerzontoro)

## 🔗 Enlace al prototipo web

* **Prototipo navegable (deploy):** [https://santiago-inteligente.vercel.app](#) *(placeholder — reemplazar al deployar en Vercel/Netlify)*
* **Prototipo local:** `npm run dev` → http://localhost:5173

## 📄 Enlaces a los documentos

> Documentos en la carpeta del repositorio (Anexo B) — no externos:

* [Propuesta Comercial (PDF)](./docs/hito-1/propuesta.pdf)
* [Láminas de Presentación (PDF)](./docs/hito-1/presentacion.pdf)
* [Diagrama Arquitectura Técnica (PNG)](./docs/hito-1/arquitectura.png)
* [Diagrama Arquitectura Información](./Arquitectura_Informacion.md)
* [Diagrama Arquitectura Técnica (Mermaid)](./Arquitectura_tecnica.md)
* **Video demostrativo:** [Enlace a video (YouTube/Drive)](#) *(agregar URL)*

---

## ⚙️ Instalación y Ejecución

### Prerrequisitos
* Node.js v18+
* npm v9+
* MongoDB local o Atlas (ver `db/`)

### Estructura mínima (Anexo B)
```
.
├── README.md
├── docs/            # PDFs, diagramas e imágenes
├── db/              # modelo y script de creación
├── src/             # código fuente organizado por capas
├── .gitignore
└── .env.example
```

### Pasos
```bash
# 1. Clonar
git clone https://github.com/Sxnr/Santiago-Inteligente.git
cd Santiago-Inteligente

# 2. Variables de entorno
cp .env.example .env   # completar valores locales

# 3. Instalar dependencias
npm install

# 4. Crear datos (opcional)
# con mongosh: mongosh < db/script-creacion.js

# 5. Desarrollo
npm run dev

# 6. Build producción
npm run build
npm run preview
```

### Stack
* Vite + React 18 + Tailwind CSS 3.4 + Framer Motion
* Cliente: Axios + Zod (validación) — Capa Cliente
* Servidor: Express (simulado), Mongoose ODM — Capa Servidor
* Datos: MongoDB NoSQL (colección POIs esquemas variables)
