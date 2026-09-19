import { poisRepository } from './repository.js'

// Capa Servidor: Motor de Filtrado (Controller)
// Controller recibe datos mapeados del Repo y arma Itinerario hiper-local
export async function motorDeFiltrado({ tiempo, presupuesto, intereses }) {
  // Repo -> Controller: datos brutos + mapeo
  const { datosBrutos, meta } = await poisRepository.findByFiltros({ tiempo, presupuesto, intereses })

  // Controller arma itinerario optimizado a pie (2.4km ejemplo)
  const paradas = datosBrutos.map((poi, i) => {
    const startMin = 10 * 60 + 30 + i * 65 // 10:30 base + offset
    const endMin = startMin + poi.tiempoMin
    const fmt = (m) => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`
    return {
      ...poi,
      orden: i + 1,
      hora: `${fmt(startMin)} - ${fmt(endMin)}`,
      distanciaSig: i < datosBrutos.length - 1 ? "320m a pie" : "fin",
    }
  })

  const duracionHoras = (meta.tiempoTotalMin / 60).toFixed(1)
  const itinerario = {
    titulo: intereses.includes("Museos") ? "Ruta Bellas Artes & Forestal" : "Ruta Hiper-Local Optimizada",
    duracionTotal: `${Math.floor(meta.tiempoTotalMin/60)}h ${(meta.tiempoTotalMin%60).toString().padStart(2,'0')}m`,
    distancia: "2.4 km a pie",
    costoTotal: `$${meta.costoTotal.toLocaleString('es-CL')}`,
    horario: "Mar-Dom 10:00-18:30",
    precioEntrada: "$3.000 General / $1.500 Estudiantes",
    paradas,
    meta: { ...meta, duracionHoras, viable: paradas.length > 0 },
    // Para debug técnico: traza del flujo sin Nginx
    trace: ["UI", "State", "HTTP POST /api/rutas/sugerir", "Router", "Zod", "Controller", "Repo", "ODM.find", "CollPOI"]
  }

  // Simula Controller -> Router: arma respuesta
  await new Promise(r => setTimeout(r, 150))
  return itinerario
}
