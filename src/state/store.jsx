import { createContext, useContext, useState } from 'react'
import { api } from '../api/httpClient.js'

// Capa Cliente: Gestor de Estado (State) + Interfaz P02
// UI -> State -> HTTP (Axios) según Arq. Técnica
const RouteCtx = createContext(null)

export function RouteProvider({ children }) {
  const [preferencias, setPreferencias] = useState({ tiempo: 3.5, presupuesto: 15000, intereses: ['Museos', 'Histórico'] })
  const [itinerario, setItinerario] = useState(null)
  const [rutaGuardada, setRutaGuardada] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [poiDetalle, setPoiDetalle] = useState(null)

  // State -> HTTP (Axios) -> Router
  async function generarRuta(nuevasPrefs) {
    const prefs = nuevasPrefs || preferencias
    setLoading(true); setError(null)
    try {
      const data = await api.sugerirRuta(prefs)
      setItinerario(data)
      return data
    } catch (e) {
      setError(e.message || "Error al generar")
      throw e
    } finally { setLoading(false) }
  }

  async function cargarPoi(id) {
    setLoading(true)
    try {
      const poi = await api.getPoi(id)
      setPoiDetalle(poi)
      return poi
    } finally { setLoading(false) }
  }

  function guardarRuta() {
    if (itinerario) setRutaGuardada({ ...itinerario, guardadaEn: new Date().toISOString() })
  }

  return (
    <RouteCtx.Provider value={{
      preferencias, setPreferencias,
      itinerario, setItinerario,
      rutaGuardada, guardarRuta,
      poiDetalle, cargarPoi,
      loading, error, generarRuta
    }}>
      {children}
    </RouteCtx.Provider>
  )
}

export function useRouteStore() {
  const ctx = useContext(RouteCtx)
  if (!ctx) throw new Error("useRouteStore fuera de RouteProvider")
  return ctx
}
