import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouteStore } from './state/store.jsx'
import { validarPreferencias } from './schemas/routeSchema.js'

// Datos UI con fotos reales de Santiago
const rutasPopularesUI = [
  {
    id: "r_santiago_historico",
    titulo: "Santiago Histórico",
    duracion: "3h 45m",
    rating: 4.8,
    reviews: 342,
    precio: "$4.500",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Plaza_de_Armas_Santiago_Chile.jpg?width=800",
    fallback: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=800&auto=format&fit=crop",
    lugares: ["Plaza de Armas", "Palacio La Moneda", "Catedral Metropolitana"],
  },
  {
    id: "r_bellavista",
    titulo: "Bohemio Bellavista",
    duracion: "2h 30m",
    rating: 4.9,
    reviews: 189,
    precio: "$12.000",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/La_Chascona.jpg?width=800",
    fallback: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop",
    lugares: ["La Chascona", "Patio Bellavista", "Cerro San Cristóbal"],
  },
  {
    id: "r_parques",
    titulo: "Parques & Arte",
    duracion: "4h 10m",
    rating: 4.7,
    reviews: 210,
    precio: "$7.000",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Museo%20Nacional%20de%20Bellas%20Artes%20Santiago.jpg?width=800",
    fallback: "https://images.unsplash.com/photo-1555993539-1732b0258235?q=80&w=800&auto=format&fit=crop",
    lugares: ["Parque Forestal", "Bellas Artes", "GAM"],
  },
]

const imagenLastarriaReal = "https://commons.wikimedia.org/wiki/Special:FilePath/Jose%20Victorino%20Lastarria.jpg?width=800"
const fallbackLastarria = "https://images.unsplash.com/photo-1519662978799-67fa9b6d5b3b?q=80&w=800&auto=format&fit=crop"

const IconBell = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 8a6 6 0 0 1 12 0c0 7-6 5-6 9a1.5 1.5 0 0 1-3 0c0-4-3-2-3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>)
const IconSearch = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>)
const IconStar = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="#FFC727" stroke="#FFC727"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)
const IconClock = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>)

export default function App() {
  const [pantalla, setPantalla] = useState('HOME')
  const [filtroActivo, setFiltroActivo] = useState('Todos')
  const [poiFicha, setPoiFicha] = useState(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(35)
  const [errorForm, setErrorForm] = useState(null)
  // Checklist de visita: qué ya se visitó en la ruta actual
  const [visitados, setVisitados] = useState(new Set())

  const { preferencias, setPreferencias, itinerario, generarRuta, guardarRuta, rutaGuardada, cargarPoi, loading } = useRouteStore()

  const categorias = ['Museos', 'Gastronomía', 'Histórico', 'Parques', 'Shopping', 'Vida Nocturna']
  const filtrosRapidos = ['Todos', 'Museos', 'Gastronomía', 'Parques']

  useEffect(() => {
    if (!audioPlaying) return
    const id = setInterval(() => setAudioProgress(p => (p < 100 ? p + 0.5 : 0)), 200)
    return () => clearInterval(id)
  }, [audioPlaying])

  // Reset checklist al generar nueva ruta
  useEffect(() => {
    if (itinerario) setVisitados(new Set())
  }, [itinerario?.titulo])

  const toggleInteres = (cat) => {
    const nuevos = preferencias.intereses.includes(cat) ? preferencias.intereses.filter(c => c !== cat) : [...preferencias.intereses, cat]
    setPreferencias({ ...preferencias, intereses: nuevos })
    setErrorForm(null)
  }

  const toggleVisitado = (id) => {
    setVisitados(prev => {
      const ns = new Set(prev)
      if (ns.has(id)) ns.delete(id)
      else ns.add(id)
      return ns
    })
  }

  const handleGenerar = async () => {
    const res = validarPreferencias(preferencias)
    if (!res.success) {
      setErrorForm(res.error.issues[0]?.message || "Revisa formulario")
      return
    }
    try {
      await generarRuta(preferencias)
      setPantalla('RUTA')
    } catch (e) {
      setErrorForm(e.message)
    }
  }

  const handleGuardar = () => {
    guardarRuta()
    setPantalla('GUARDADA')
  }

  const abrirFichaPoi = async (poi) => {
    setPoiFicha(poi)
    try { await cargarPoi(poi.id) } catch {}
    setPantalla('POI')
  }

  const progreso = itinerario ? Math.round((visitados.size / (itinerario.paradas?.length || 1)) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0A2540] flex justify-center py-4 px-2 md:py-6">
      <div className="w-full max-w-md mx-auto bg-[#F8FAFC] h-[844px] md:h-[860px] shadow-xl rounded-[32px] overflow-hidden relative flex flex-col border border-white/20">
        <div className="flex-1 overflow-y-auto no-scrollbar relative bg-[#F8FAFC]">
          <AnimatePresence mode="wait">
            {/* HOME */}
            {pantalla === 'HOME' && (
              <motion.div key="HOME" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }} className="pb-28">
                <div className="px-5 pt-6 pb-2 flex items-center justify-between bg-white border-b border-[#E6EEF7]">
                  <div className="flex items-center gap-3">
                    <img src="https://i.pravatar.cc/100?img=33" alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[#E6EEF7]" />
                    <div>
                      <h1 className="text-[15px] font-extrabold leading-none text-[#0F305B]">Santiago Inteligente</h1>
                      <p className="text-[10px] tracking-[0.14em] text-[#5A7896] font-bold uppercase mt-0.5">Explorador Urbano</p>
                    </div>
                  </div>
                  <button onClick={() => setPantalla('AYUDA')} className="w-10 h-10 rounded-full bg-white border border-[#E6EEF7] grid place-items-center shadow-sm text-[#0F305B] relative">
                    <IconBell /><span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFC727] rounded-full text-[#0F305B] text-[11px] grid place-items-center font-extrabold border-2 border-white">3</span>
                  </button>
                </div>
                <div className="px-5 mt-4">
                  <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-[#E6EEF7] shadow-sm">
                    <span className="text-[#8AA0B8]"><IconSearch /></span>
                    <input disabled placeholder="¿Qué quieres explorar hoy?" className="bg-transparent outline-none text-sm placeholder:text-[#8AA0B8] w-full font-medium text-[#0F305B]" />
                    <span className="w-8 h-8 rounded-full bg-[#F1F5F9] grid place-items-center border border-[#E6EEF7] text-[#0F305B] text-sm">⚙</span>
                  </div>
                </div>
                <div className="px-5 mt-3 grid grid-cols-4 gap-2">
                  {[
                    { label: "Perfil", icon: "👤", go: "PERFIL" },
                    { label: "Crear Ruta", icon: "✦", go: "FORM" },
                    { label: "Mis Rutas", icon: "🗺️", go: "MISRUTAS" },
                    { label: "Ayuda", icon: "?", go: "AYUDA" },
                  ].map(b => (
                    <button key={b.label} onClick={() => setPantalla(b.go)} className="bg-white border border-[#E6EEF7] rounded-2xl p-2.5 flex flex-col items-center gap-1 shadow-sm hover:border-[#0F305B] transition">
                      <span className="w-8 h-8 rounded-full bg-[#E6EEF7] grid place-items-center text-sm">{b.icon}</span>
                      <span className="text-[11px] font-extrabold text-[#0F305B] text-center leading-none">{b.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar px-5 pb-1">
                  {filtrosRapidos.map(f => (
                    <button key={f} onClick={() => setFiltroActivo(f)} className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold border transition flex items-center gap-1.5 ${filtroActivo===f ? 'bg-[#0F305B] text-white border-[#0F305B] shadow' : 'bg-white border-[#E6EEF7] text-[#3A5A7A]'}`}>{f==='Museos' && <span>🏛️</span>} {f}</button>
                  ))}
                </div>
                <div className="px-5 mt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-[#0F305B] text-[16px]">Rutas Populares</h3>
                    <button onClick={() => setPantalla('RUTA')} className="text-sm font-bold text-[#5A7896]">Ver todas</button>
                  </div>
                  <div className="mt-3 space-y-4">
                    {rutasPopularesUI.slice(0,1).map(ruta => (
                      <motion.div key={ruta.id} whileTap={{ scale: 0.98 }} onClick={() => { setPantalla('RUTA'); if(!itinerario) generarRuta() }} className="rounded-[20px] overflow-hidden border border-[#E6EEF7] bg-white shadow-sm cursor-pointer group">
                        <div className="relative h-44">
                          <img src={ruta.imagen} alt={ruta.titulo} onError={(e)=>{ if(e.currentTarget.src!==ruta.fallback) e.currentTarget.src=ruta.fallback }} className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-3 bg-white px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-extrabold shadow text-[#0F305B]"><IconStar /> 4.8</div>
                        </div>
                        <div className="px-4 py-3.5 bg-white">
                          <h4 className="font-extrabold text-[#0F305B] text-[15px] leading-none">{ruta.titulo}</h4>
                          <div className="flex items-center gap-1.5 text-[#5A7896] text-xs mt-1.5 font-semibold"><IconClock /> {ruta.duracion}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="px-5 mt-5">
                  <div className="rounded-[20px] bg-[#0F305B] p-5 text-white relative overflow-hidden border border-[#1A3A5A]">
                    <h3 className="font-extrabold text-white text-[16px] leading-tight relative">Desbloquea Guías<br/>Exclusivas</h3>
                    <p className="text-white/80 text-xs mt-1.5 leading-relaxed relative font-medium">Accede a rutas offline y<br/>descuentos premium en<br/>comercios locales.</p>
                    <button onClick={() => setPantalla('FORM')} className="mt-4 bg-[#FFC727] hover:bg-[#FFB800] text-[#0F305B] px-5 py-2.5 rounded-full text-xs font-extrabold shadow">Mejorar a Premium</button>
                  </div>
                  <button onClick={() => setPantalla('FORM')} className="mt-3 w-full bg-white border-2 border-[#0F305B] text-[#0F305B] font-extrabold py-3.5 rounded-full text-sm flex items-center justify-center gap-2 shadow-sm">✦ Planifica tu ruta inteligente →</button>
                  <p className="text-center text-[11px] text-[#5A7896] mt-1.5 font-medium">Dinos tu tiempo y presupuesto. Nosotros armamos lo imposible.</p>
                </div>
                <div className="px-5 mt-6">
                  <h3 className="font-extrabold text-[#0F305B] text-[15px]">Descubre el Barrio Lastarria</h3>
                  <div className="mt-3 rounded-[20px] overflow-hidden border border-[#E6EEF7] bg-white shadow-sm">
                    <div className="relative h-56">
                      <img src={imagenLastarriaReal} alt="Lastarria" onError={(e)=>{ if(e.currentTarget.src!==fallbackLastarria) e.currentTarget.src=fallbackLastarria }} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F305B]/90 via-[#0F305B]/30 to-transparent" />
                      <div className="absolute inset-0 p-4 flex flex-col">
                        <div className="flex gap-1.5"><span className="text-[8px] font-bold bg-white/20 text-white px-2 py-1 rounded-full border border-white/20">PATRIMONIO</span><span className="text-[8px] font-bold bg-[#FFC727] text-[#0F305B] px-2 py-1 rounded-full">BOHEMIO</span></div>
                        <div className="mt-auto">
                          <div className="bg-white/95 backdrop-blur rounded-xl p-3 border border-white/50">
                            <p className="text-[10px] font-extrabold text-[#0F305B] tracking-widest uppercase">Lifestyle • Historia • 1.2km</p>
                            <p className="text-xs text-[#3A5A7A] mt-1 leading-snug font-medium">Cafés de autor, GAM a pasos. Ruta 2h • $9.000 CLP.</p>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-white">
                            <span className="text-sm font-extrabold">Lastarria: Arte & Cultura</span>
                            <button onClick={() => setPantalla('RUTA')} className="w-8 h-8 rounded-full bg-[#FFC727] text-[#0F305B] grid place-items-center font-bold shadow">→</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PERFIL */}
            {(pantalla==='PERFIL' || pantalla==='DATOS') && (
              <motion.div key="perfil" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="pb-28">
                <div className="bg-white border-b border-[#E6EEF7] px-5 pt-6 pb-4">
                  <button onClick={()=> setPantalla('HOME')} className="text-xs font-bold text-[#0F305B] flex items-center gap-1">‹ Volver al inicio</button>
                  <h1 className="text-lg font-extrabold text-[#0F305B] mt-2">Mi Perfil</h1>
                  <p className="text-sm text-[#5A7896]">Gestiona tu identidad exploradora</p>
                </div>
                <div className="px-5 mt-5">
                  <div className="bg-white border border-[#E6EEF7] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src="https://i.pravatar.cc/100?img=33" className="w-14 h-14 rounded-full border-2 border-[#E6EEF7]" alt="avatar"/>
                      <div><p className="font-extrabold text-[#0F305B]">Francisco Carrera</p><p className="text-xs text-[#5A7896]">francisco@santiago.inteligente.cl</p><p className="text-xs text-[#5A7896]">Explorador nivel 3 • 12 rutas completadas</p></div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl p-3"><p className="font-bold text-[#0F305B]">Presupuesto favorito</p><p className="text-[#5A7896]">${preferencias.presupuesto.toLocaleString('es-CL')} CLP</p></div>
                      <div className="bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl p-3"><p className="font-bold text-[#0F305B]">Tiempo medio</p><p className="text-[#5A7896]">{preferencias.tiempo}h</p></div>
                    </div>
                    <div className="mt-4 bg-[#F1F5F9] border border-[#E6EEF7] rounded-xl p-3">
                      <p className="text-xs font-extrabold text-[#0F305B]">Tu progreso</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white border border-[#E6EEF7] rounded-full overflow-hidden"><div className="h-full bg-[#0F305B] rounded-full" style={{ width: rutaGuardada ? "75%" : "30%" }}/></div>
                        <span className="text-xs font-bold text-[#0F305B]">{rutaGuardada ? "3/4" : "0/4"} rutas</span>
                      </div>
                      <p className="text-xs text-[#5A7896] mt-1">{rutaGuardada ? "¡Ruta guardada! Sigue explorando para subir de nivel." : "Genera tu primera ruta para empezar."}</p>
                    </div>
                    <button onClick={() => setPantalla(pantalla==='DATOS'?'PERFIL':'DATOS')} className="mt-4 w-full bg-[#0F305B] text-white font-extrabold py-3 rounded-full text-sm">{pantalla==='DATOS' ? 'Cerrar' : 'Editar mis datos'}</button>
                  </div>
                  {pantalla==='DATOS' && (
                    <div className="mt-4 bg-white border border-[#E6EEF7] rounded-2xl p-5 shadow-sm">
                      <p className="text-xs font-bold text-[#0F305B]">Datos editables</p>
                      <p className="text-xs text-[#5A7896] mt-1">Formulario conectado a la colección de usuarios. Cambios se reflejan en tus preferencias de ruta.</p>
                      <div className="mt-3 space-y-2">
                        <input placeholder="Nombre" defaultValue="Francisco Carrera" className="w-full bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl px-3 py-2.5 text-sm font-medium text-[#0F305B] outline-none focus:border-[#0F305B]" />
                        <input placeholder="Correo" defaultValue="francisco@santiago.inteligente.cl" className="w-full bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl px-3 py-2.5 text-sm font-medium text-[#0F305B] outline-none focus:border-[#0F305B]" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* FORMULARIO */}
            {pantalla==='FORM' && (
              <motion.div key="form" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="pb-28 bg-[#F8FAFC]">
                <div className="bg-white border-b border-[#E6EEF7] px-5 pt-6 pb-4">
                  <button onClick={()=> setPantalla('HOME')} className="text-xs font-bold text-[#0F305B]">‹ Volver</button>
                  <h1 className="text-lg font-extrabold text-[#0F305B] mt-1">Planifica tu ruta</h1>
                  <p className="text-sm text-[#5A7896] font-medium">Ajusta tus restricciones. Te mostramos solo lo viable.</p>
                </div>
                <div className="px-5 mt-5">
                  <div className="bg-white border border-[#E6EEF7] rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-[#0F305B] flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-[#E6EEF7] grid place-items-center text-sm border border-[#D6E3F3]">⏱</span> Tiempo disponible</h3>
                      <span className="bg-[#0F305B] text-white text-sm font-extrabold px-3 py-1.5 rounded-full">{preferencias.tiempo}h</span>
                    </div>
                    <input type="range" min="1" max="8" step="0.5" value={preferencias.tiempo} onChange={e=> setPreferencias({ ...preferencias, tiempo: parseFloat(e.target.value)})} className="w-full mt-5" />
                    <div className="flex justify-between text-xs text-[#5A7896] mt-1 font-bold"><span>1h</span><span>4h</span><span>8h</span></div>
                  </div>
                </div>
                <div className="px-5 mt-4">
                  <div className="bg-white border border-[#E6EEF7] rounded-2xl p-5 shadow-sm">
                    <h3 className="font-extrabold text-[#0F305B] flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-[#ECFDF5] grid place-items-center text-sm border border-[#D1FAE5]">💰</span> Presupuesto total (CLP)</h3>
                    <div className="mt-4 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7896] font-bold">$</span>
                      <input type="number" value={preferencias.presupuesto} onChange={e=> setPreferencias({ ...preferencias, presupuesto: Number(e.target.value)||0 })} className="w-full bg-[#F1F5F9] border border-[#E6EEF7] rounded-xl pl-7 pr-4 py-3.5 font-extrabold text-[#0F305B] outline-none focus:border-[#0F305B]" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[10000,15000,25000].map(v=> (
                        <button key={v} onClick={()=> setPreferencias({ ...preferencias, presupuesto: v })} className={`py-2 rounded-full text-xs font-extrabold border ${preferencias.presupuesto===v ? 'bg-[#0F305B] text-white border-[#0F305B]' : 'bg-white border-[#E6EEF7] text-[#3A5A7A]'}`}>${v.toLocaleString('es-CL')}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="px-5 mt-4">
                  <div className="bg-white border border-[#E6EEF7] rounded-2xl p-5 shadow-sm">
                    <h3 className="font-extrabold text-[#0F305B]">Intereses</h3>
                    <p className="text-xs text-[#5A7896] mt-1 font-medium">Elige al menos uno para personalizar</p>
                    <div className="grid grid-cols-2 gap-2.5 mt-4">
                      {categorias.map(cat=>{
                        const activo=preferencias.intereses.includes(cat)
                        const icons={'Museos':'🏛️','Gastronomía':'🍽️','Histórico':'🏰','Parques':'🌳','Shopping':'🛍️','Vida Nocturna':'🌃'}
                        return (
                          <button key={cat} onClick={()=> toggleInteres(cat)} className={`flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border text-sm font-extrabold text-left transition ${activo ? 'bg-[#0F305B] text-white border-[#0F305B] shadow' : 'bg-[#F8FAFC] border-[#E6EEF7] text-[#3A5A7A]'}`}>
                            <span className={`w-8 h-8 rounded-full grid place-items-center text-sm ${activo ? 'bg-white/15' : 'bg-white border border-[#E6EEF7]'}`}>{icons[cat]}</span>
                            {cat}{activo && <span className="ml-auto">✓</span>}
                          </button>
                        )
                      })}
                    </div>
                    {errorForm && <p className="text-xs text-red-600 mt-2 font-bold">⚠ {errorForm}</p>}
                  </div>
                </div>
                <div className="px-5 mt-6">
                  <button onClick={handleGenerar} disabled={loading} className="w-full bg-[#0F305B] hover:bg-[#0A2540] disabled:bg-slate-300 text-white font-extrabold py-4 rounded-full shadow-lg flex items-center justify-center gap-2 transition">
                    {loading ? <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"/> Generando tu ruta...</> : <>✨ Generar Ruta</>}
                  </button>
                  <p className="text-center text-xs text-[#5A7896] mt-2 font-medium">Solo verás lugares que encajan en tu tiempo y presupuesto.</p>
                </div>
              </motion.div>
            )}

            {/* RUTA SUGERIDA - con CHECKLIST */}
            {pantalla==='RUTA' && (
              <motion.div key="ruta" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="pb-28 bg-[#F8FAFC]">
                <div className="relative h-[264px] w-full overflow-hidden">
                  <img src={itinerario?.paradas?.[0]?.imagen || "https://commons.wikimedia.org/wiki/Special:FilePath/Museo%20Nacional%20de%20Bellas%20Artes%20Santiago.jpg?width=1200"} alt="Ruta" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/85 via-[#0A2540]/35 to-[#0A2540]/10" />
                  <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
                    <button onClick={()=> setPantalla('HOME')} className="bg-white px-4 py-2 rounded-full text-[13px] font-extrabold shadow-md text-[#0F305B] flex items-center gap-1.5 border border-white leading-none"><span className="text-[16px]">‹</span> Santiago Inteligente</button>
                    <button onClick={handleGuardar} className="w-9 h-9 rounded-full bg-[#FFC727] grid place-items-center shadow-md text-[#0F305B] border border-white">♡</button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-10">
                    <div className="inline-flex items-center bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-[#0F305B] shadow border border-white gap-1.5">
                      <span>{itinerario?.duracionTotal || "3h 15m"}</span><span className="w-1 h-1 bg-[#8AA0B8] rounded-full"/><span>{itinerario?.distancia || "2.4 km a pie"}</span><span className="w-1 h-1 bg-[#8AA0B8] rounded-full"/><span>{itinerario?.costoTotal || "$8.500"}</span>
                    </div>
                    <h1 className="text-[20px] font-extrabold leading-tight mt-2.5 text-white drop-shadow-md">{itinerario?.titulo || "Ruta Bellas Artes & Forestal"}</h1>
                    <p className="text-white/95 text-xs mt-1.5 flex items-center gap-1.5 font-medium"><span className="flex items-center gap-1"><IconClock /> {itinerario?.horario || "Mar-Dom 10:00-18:30"}</span><span>•</span><span>{itinerario?.precioEntrada || "$3.000 General"}</span></p>
                  </div>
                </div>
                {/* CHECKLIST PROGRESO - relacionado al proyecto: qué ya visitaste */}
                <div className="px-5 mt-4">
                  <div className="bg-white border border-[#E6EEF7] rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-[#0F305B] text-sm flex items-center gap-2">☑️ Mi checklist de visita</h3>
                      <span className="text-xs font-extrabold bg-[#0F305B] text-white px-2.5 py-1 rounded-full">{visitados.size}/{itinerario?.paradas?.length || 0}</span>
                    </div>
                    <div className="mt-3 h-2 bg-[#F1F5F9] border border-[#E6EEF7] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0F305B] rounded-full transition-all" style={{ width: `${progreso}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs font-bold text-[#5A7896]">{progreso}% completado</p>
                      <p className="text-xs text-[#5A7896]">{visitados.size === (itinerario?.paradas?.length||0) && itinerario ? "¡Ruta completada! 🎉" : "Marca cada lugar al visitarlo"}</p>
                    </div>
                    {visitados.size>0 && (
                      <button onClick={()=> setVisitados(new Set())} className="mt-2 text-xs font-bold text-[#0F305B] underline">Reiniciar checklist</button>
                    )}
                  </div>
                </div>
                <div className="px-5 mt-4 space-y-4">
                  <div className="rounded-2xl overflow-hidden border border-[#E6EEF7] shadow-sm bg-white">
                    <div className="h-36 bg-[#E6EEF7] relative grid place-items-center overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" alt="mapa" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                      <div className="relative bg-white rounded-xl shadow px-3 py-2 flex items-center gap-2 border border-[#E6EEF7]"><span className="w-2 h-2 bg-[#0F305B] rounded-full animate-pulse"/><span className="text-xs font-extrabold text-[#0F305B]">Mapa en vivo</span><span className="text-xs text-[#5A7896] font-medium">• {itinerario?.distancia || "2.4 km"} • {itinerario?.paradas?.length || 4} paradas</span></div>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between bg-white"><p className="text-xs font-extrabold text-[#0F305B]">Ruta optimizada a pie</p><button className="text-xs font-extrabold text-[#0F305B]">Abrir en Maps →</button></div>
                  </div>
                  <div className="bg-[#0F305B] rounded-2xl p-4 text-white border border-[#1A3A5A]">
                    <div className="flex items-center gap-3">
                      <img src="https://i.pravatar.cc/100?img=15" alt="guia" className="w-10 h-10 rounded-full object-cover border-2 border-white/20" />
                      <div className="flex-1"><p className="text-sm font-extrabold leading-none">Guía Virtual • Javiera</p><p className="text-xs text-white/70">"El Bellas Artes guarda la colección más antigua..."</p></div>
                      <button onClick={()=> setAudioPlaying(!audioPlaying)} className="w-10 h-10 rounded-full bg-[#FFC727] text-[#0F305B] grid place-items-center font-bold shadow">{audioPlaying ? '❚❚' : '▶'}</button>
                    </div>
                    <div className="mt-3 flex items-center gap-3"><span className="text-xs font-mono text-white/70">01:12</span><div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-[#FFC727] rounded-full transition-all" style={{ width: `${audioProgress}%` }}/></div><span className="text-xs font-mono text-white/70">03:24</span></div>
                  </div>
                </div>
                <div className="px-5 mt-6">
                  <h3 className="font-extrabold text-[#0F305B]">Tu itinerario</h3>
                  <p className="text-xs text-[#5A7896] mt-1 font-medium">Toca el checkbox al visitar cada lugar. Se guarda en tu checklist.</p>
                  <div className="mt-4 space-y-3">
                    {(itinerario?.paradas || []).map((p,i)=> {
                      const hecho = visitados.has(p.id)
                      return (
                        <div key={p.id || p.nombre} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <label className={`w-8 h-8 rounded-full grid place-items-center text-xs font-extrabold border-2 cursor-pointer transition ${hecho ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-[#3A5A7A] border-[#E6EEF7] hover:border-[#0F305B]'}`}>
                              <input type="checkbox" checked={hecho} onChange={()=> toggleVisitado(p.id)} className="sr-only" />
                              {hecho ? '✓' : i+1}
                            </label>
                            {i < (itinerario?.paradas?.length-1) && <div className={`w-0.5 flex-1 mt-1 ${hecho ? 'bg-emerald-200' : 'bg-[#E6EEF7]'}`} style={{ minHeight: 32 }}/>}
                          </div>
                          <button onClick={()=> abrirFichaPoi(p)} className={`flex-1 border rounded-2xl p-3 flex gap-3 shadow-sm text-left transition ${hecho ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-[#E6EEF7] hover:border-[#0F305B]'}`}>
                            <img src={p.imagen} alt={p.nombre} onError={(e)=>{ if(p.fallback && e.currentTarget.src!==p.fallback) e.currentTarget.src=p.fallback }} className={`w-16 h-16 rounded-xl object-cover border ${hecho ? 'border-emerald-200 opacity-70' : 'border-[#E6EEF7]'}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-extrabold leading-tight truncate ${hecho ? 'text-emerald-700 line-through' : 'text-[#0F305B]'}`}>{p.nombre}</p>
                              <p className="text-xs text-[#5A7896] mt-0.5 font-medium">{p.hora} • {p.tiempoMin} min</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className={`text-xs font-bold border px-2 py-0.5 rounded-full ${hecho ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-[#E6EEF7] text-[#0F305B] border-[#D6E3F3]'}`}>{hecho ? 'Visitado' : p.costoLabel}</span>
                                <span className="text-xs text-[#5A7896]">{hecho ? '¡Hecho!' : p.distanciaSig}</span>
                              </div>
                            </div>
                            <span className="text-[#0F305B] text-xs font-bold">›</span>
                          </button>
                        </div>
                      )
                    })}
                    {(!itinerario || itinerario.paradas.length===0) && <p className="text-xs text-[#5A7896] bg-white border border-dashed border-[#E6EEF7] rounded-xl p-4 text-center">Sin lugares viables para ese presupuesto/tiempo. Ajusta tus preferencias.</p>}
                  </div>
                </div>
                <div className="px-5 mt-6 flex gap-3">
                  <button onClick={()=> setPantalla('FORM')} className="flex-1 bg-white border border-[#E6EEF7] font-extrabold py-3.5 rounded-full text-sm text-[#0F305B]">← Ajustar ruta</button>
                  <button onClick={handleGuardar} className="flex-1 bg-[#FFC727] text-[#0F305B] font-extrabold py-3.5 rounded-full text-sm shadow border border-[#FFB800]">Guardar ruta</button>
                </div>
                <div className="px-5 mt-3"><button onClick={()=> setPantalla('HOME')} className="w-full bg-[#0F305B] text-white font-extrabold py-3.5 rounded-full text-sm">Volver al inicio</button></div>
              </motion.div>
            )}

            {/* MIS RUTAS */}
            {(pantalla==='MISRUTAS' || pantalla==='GUARDADA') && (
              <motion.div key="misrutas" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="pb-28">
                <div className="bg-white border-b border-[#E6EEF7] px-5 pt-6 pb-4">
                  <button onClick={()=> setPantalla('HOME')} className="text-xs font-bold text-[#0F305B]">‹ Volver</button>
                  <h1 className="text-lg font-extrabold text-[#0F305B] mt-1">Mis Rutas</h1>
                  <p className="text-sm text-[#5A7896]">Tus itinerarios guardados y su avance</p>
                </div>
                <div className="px-5 mt-5">
                  {!rutaGuardada ? (
                    <div className="bg-white border border-dashed border-[#E6EEF7] rounded-2xl p-8 text-center">
                      <p className="text-3xl">🗺️</p>
                      <p className="font-extrabold text-[#0F305B] mt-2">Sin rutas guardadas</p>
                      <p className="text-xs text-[#5A7896] mt-1">Genera una y pulsa “Guardar ruta”.</p>
                      <button onClick={()=> setPantalla('FORM')} className="mt-4 bg-[#0F305B] text-white font-extrabold px-5 py-2.5 rounded-full text-sm">Crear ruta</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white border border-[#E6EEF7] rounded-2xl overflow-hidden shadow-sm">
                        <img src={rutaGuardada.paradas?.[0]?.imagen} alt={rutaGuardada.titulo} className="h-32 w-full object-cover" />
                        <div className="p-4">
                          <h3 className="font-extrabold text-[#0F305B]">{rutaGuardada.titulo}</h3>
                          <p className="text-xs text-[#5A7896] mt-1">{rutaGuardada.duracionTotal} • {rutaGuardada.distancia} • {rutaGuardada.costoTotal}</p>
                          <p className="text-xs text-[#8AA0B8] mt-1">Guardada: {new Date(rutaGuardada.guardadaEn).toLocaleString('es-CL')}</p>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs font-bold text-[#0F305B]"><span>Avance</span><span>{visitados.size}/{rutaGuardada.paradas.length}</span></div>
                            <div className="mt-1 h-2 bg-[#F1F5F9] border border-[#E6EEF7] rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${rutaGuardada.paradas.length ? (visitados.size/rutaGuardada.paradas.length)*100 : 0}%` }}/></div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button onClick={()=> setPantalla('RUTA')} className="flex-1 bg-white border border-[#E6EEF7] font-bold py-2 rounded-full text-sm text-[#0F305B]">Ver itinerario</button>
                            <button onClick={()=> abrirFichaPoi(rutaGuardada.paradas[0])} className="flex-1 bg-[#FFC727] font-extrabold py-2 rounded-full text-sm text-[#0F305B]">Ver detalle</button>
                          </div>
                          {/* checklist resumen */}
                          <div className="mt-4 bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl p-3">
                            <p className="text-xs font-extrabold text-[#0F305B]">Checklist de esta ruta</p>
                            <div className="mt-2 space-y-1.5">
                              {rutaGuardada.paradas.map(p=> (
                                <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer">
                                  <input type="checkbox" checked={visitados.has(p.id)} onChange={()=> toggleVisitado(p.id)} className="w-4 h-4 rounded border-[#CBD5E1] text-[#0F305B] focus:ring-[#0F305B]" />
                                  <span className={visitados.has(p.id) ? "line-through text-[#5A7896]" : "text-[#0F305B] font-medium"}>{p.nombre}</span>
                                  {visitados.has(p.id) && <span className="ml-auto text-emerald-600 font-bold">✓</span>}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* FICHA POI */}
            {pantalla==='POI' && poiFicha && (
              <motion.div key="poi" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="pb-28 bg-[#F8FAFC]">
                <div className="relative h-56 w-full overflow-hidden">
                  <img src={poiFicha.imagen} alt={poiFicha.nombre} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/80 to-transparent" />
                  <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
                    <button onClick={()=> setPantalla('RUTA')} className="bg-white px-4 py-2 rounded-full text-xs font-extrabold text-[#0F305B] shadow">‹ Volver</button>
                    <label className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#E6EEF7] shadow cursor-pointer">
                      <input type="checkbox" checked={visitados.has(poiFicha.id)} onChange={()=> toggleVisitado(poiFicha.id)} className="w-4 h-4 rounded border-[#CBD5E1] text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-xs font-extrabold text-[#0F305B]">{visitados.has(poiFicha.id) ? "Visitado" : "Marcar visitado"}</span>
                    </label>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                    <span className="bg-white/95 text-[#0F305B] text-xs font-bold px-2.5 py-1 rounded-full border border-white">{poiFicha.categoria}</span>
                    <h1 className="text-lg font-extrabold text-white mt-2 leading-tight">{poiFicha.nombre}</h1>
                    <p className="text-white/90 text-xs mt-1">{poiFicha.horario} • {poiFicha.costoLabel}</p>
                  </div>
                </div>
                <div className="px-5 mt-5">
                  <div className="bg-white border border-[#E6EEF7] rounded-2xl p-4 shadow-sm">
                    <h3 className="font-extrabold text-[#0F305B]">Detalle del lugar</h3>
                    <p className="text-xs text-[#5A7896] mt-1">Información completa y estado de tu visita</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl px-3 py-2"><span className="font-bold text-[#0F305B]">Tiempo sugerido</span><span className="text-[#5A7896]">{poiFicha.tiempoMin} min</span></div>
                      <div className="flex justify-between bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl px-3 py-2"><span className="font-bold text-[#0F305B]">Estado</span><span className={`font-bold ${visitados.has(poiFicha.id) ? 'text-emerald-600' : 'text-amber-600'}`}>{visitados.has(poiFicha.id) ? '✓ Visitado' : 'Pendiente'}</span></div>
                      <div className="flex justify-between bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl px-3 py-2"><span className="font-bold text-[#0F305B]">Ubicación</span><span className="text-[#5A7896] font-mono text-xs">{poiFicha.coords?.join(', ')}</span></div>
                      {poiFicha.meta && <div className="bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl p-3"><p className="text-xs font-bold text-[#0F305B]">Datos del lugar:</p><pre className="text-xs text-[#5A7896] mt-1 whitespace-pre-wrap break-words">{JSON.stringify(poiFicha.meta, null, 2)}</pre></div>}
                    </div>
                    <button onClick={()=> setPantalla('HOME')} className="mt-4 w-full bg-[#0F305B] text-white font-extrabold py-3 rounded-full text-sm">Volver al inicio</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* AYUDA */}
            {(pantalla==='AYUDA') && (
              <motion.div key="ayuda" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="pb-28">
                <div className="bg-white border-b border-[#E6EEF7] px-5 pt-6 pb-4">
                  <button onClick={()=> setPantalla('HOME')} className="text-xs font-bold text-[#0F305B]">‹ Volver</button>
                  <h1 className="text-lg font-extrabold text-[#0F305B] mt-1">Ayuda</h1>
                  <p className="text-sm text-[#5A7896]">Contacto y preguntas frecuentes</p>
                </div>
                <div className="px-5 mt-5 space-y-3">
                  {[
                    { q: "¿Cómo genera rutas con mi presupuesto?", a: "Descartamos automáticamente los lugares que exceden tu tiempo y presupuesto, mostrándote solo lo viable." },
                    { q: "¿Funciona sin internet?", a: "Sí, guarda tu ruta y el checklist de visita sigue disponible offline." },
                    { q: "¿De dónde salen los datos?", a: "Lugares reales de Santiago con precios y horarios actualizados." },
                  ].map(f=> (
                    <div key={f.q} className="bg-white border border-[#E6EEF7] rounded-2xl p-4 shadow-sm">
                      <p className="font-extrabold text-[#0F305B] text-sm">{f.q}</p>
                      <p className="text-xs text-[#5A7896] mt-1 leading-relaxed">{f.a}</p>
                    </div>
                  ))}
                  <div className="bg-[#0F305B] rounded-2xl p-4 text-white"><p className="font-extrabold text-sm">¿Aún necesitas ayuda?</p><p className="text-xs text-white/70 mt-1">soporte@santiago.inteligente.cl • +56 9 1234 5678</p><button className="mt-3 bg-[#FFC727] text-[#0F305B] font-extrabold px-4 py-2 rounded-full text-xs">Contactar</button></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* NAVBAR */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E6EEF7] px-6 pt-2 pb-4 rounded-t-3xl shadow-[0_-8px_24px_rgba(15,48,91,0.08)]">
          <div className="flex items-center justify-between">
            {[
              { id: 'HOME', label: 'Explorar', icon: '⌖', go: 'HOME' },
              { id: 'FORM', label: 'Crear Ruta', icon: '✦', go: 'FORM' },
              { id: 'MISRUTAS', label: 'Mis Rutas', icon: '🗺️', go: 'MISRUTAS' },
              { id: 'PERFIL', label: 'Perfil', icon: '👤', go: 'PERFIL' },
            ].map(item => {
              const active = (pantalla==='HOME' && item.id==='HOME') || (pantalla==='FORM' && item.id==='FORM') || (pantalla==='RUTA' && item.id==='FORM') || ((pantalla==='MISRUTAS' || pantalla==='GUARDADA') && item.id==='MISRUTAS') || ((pantalla==='PERFIL' || pantalla==='DATOS') && item.id==='PERFIL')
              return (
                <button key={item.id} onClick={()=> setPantalla(item.go)} className={`flex flex-col items-center gap-1 min-w-[64px] ${active ? 'text-[#0F305B]' : 'text-[#8AA0B8]'}`}>
                  <span className={`text-lg w-7 h-7 grid place-items-center rounded-full ${active ? 'bg-[#E6EEF7]' : ''}`}>{item.icon}</span>
                  <span className="text-[11px] font-extrabold leading-none">{item.label}</span>
                </button>
              )
            })}
          </div>
          <div className="w-24 h-1 bg-[#0F305B] rounded-full mx-auto mt-3" />
        </div>

        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0A2540]/60 backdrop-blur-sm grid place-items-center z-50">
              <div className="bg-white border border-[#E6EEF7] rounded-2xl shadow-xl p-6 flex flex-col items-center gap-3 mx-8">
                <span className="w-10 h-10 border-3 border-[#E6EEF7] border-t-[#0F305B] rounded-full animate-spin" style={{ borderWidth: 3 }} />
                <p className="font-extrabold text-[#0F305B] text-sm">Generando tu ruta...</p>
                <p className="text-xs text-[#5A7896] text-center font-medium">Filtrando lugares según tu presupuesto y tiempo</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
