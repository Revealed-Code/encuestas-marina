import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  // --- CONTROL DE VIS   TAS ---
  const [modoAdmin, setModoAdmin] = useState(false);
  const [stats, setStats] = useState({ total: 0, promedios: [] });

  // --- ESTADOS DE CONTROL Y CARGA ---
  const [cargandoDepartamentos, setCargandoDepartamentos] = useState(true);
  const [errorDepartamentos, setErrorDepartamentos] = useState(false);
  const [enviandoEncuesta, setEnviandoEncuesta] = useState(false);
  const [errorEnvioEncuesta, setErrorEnvioEncuesta] = useState(null);

  // --- ESTADOS DE FLUJO ---
  const [faseActual, setFaseActual] = useState(0); 
  const [departamentos, setDepartamentos] = useState([]);
  const [enviado, setEnviado] = useState(false);
  const [pasoActual, setPasoActual] = useState(0);
  
  const [formData, setFormData] = useState({
    departamento_id: "",
    p1_trato: 5,
    p2_efectividad: 5,
    p3_facilidad_reporte: 5,
    p4_calidad_conexion: 5,
    p5_estado_equipos: 5,
    p6_comunicacion: 5,
    comentarios: ""
  });

  const preguntas = [
    { id: 'p1_trato', label: '¿Cómo califica el trato del personal?' },
    { id: 'p2_efectividad', label: '¿Qué tan efectiva fue la solución?' },
    { id: 'p3_facilidad_reporte', label: '¿Qué tan fácil fue reportar el problema?' },
    { id: 'p4_calidad_conexion', label: 'Calidad de la conexión a internet' },
    { id: 'p5_estado_equipos', label: 'Estado físico de los equipos' },
    { id: 'p6_comunicacion', label: 'Claridad en la comunicación' }
  ];

  // IP asignada a tu backend según tus capturas de pantalla

  const API_BASE_URL = 'https://encuestas-marina-production.up.railway.app';

  // --- CONTROL ANTI-SPAM (VOTO DUPLICADO) ---
  useEffect(() => {
    const yaRespondio = localStorage.getItem('miw_encuesta_completada');
    if (yaRespondio) {
      setEnviado(true);
    }
  }, []);

  // --- EFECTO: TRAER DEPARTAMENTOS O ESTADÍSTICAS ---
  useEffect(() => {
    if (modoAdmin) {
      axios.get(`${API_BASE_URL}/estadisticas/`)
        .then(res => setStats(res.data))
        .catch(err => console.error("Error al obtener estadísticas del dashboard:", err));
    } else {
      const fetchDepartamentos = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/departamentos/`);
          setDepartamentos(response.data);
          setCargandoDepartamentos(false);
        } catch (error) {
          console.error("Error al obtener departamentos:", error);
          setErrorDepartamentos(true);
          setCargandoDepartamentos(false);
        }
      };
      fetchDepartamentos();
    }
  }, [modoAdmin, API_BASE_URL]);

  // --- FUNCIÓN ENVIAR ENCUESTA ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.departamento_id) return alert("Por favor, selecciona un departamento.");

    const payload = {
      ...formData,
      departamento_id: Number(formData.departamento_id),
    };

    try {
      setEnviandoEncuesta(true);
      setErrorEnvioEncuesta(null);
      await axios.post(`${API_BASE_URL}/encuestas/`, payload);
      
      // Bloqueamos localmente para evitar spam
      localStorage.setItem('miw_encuesta_completada', 'true');
      setEnviado(true);
    } catch (err) {
      console.error("Error al enviar encuesta:", err);
      setErrorEnvioEncuesta("Error al enviar la encuesta. Inténtalo de nuevo.");
      alert("Error de red al enviar. Verifica tu conexión.");
    } finally {
      setEnviandoEncuesta(false);
    }
  };

  // ==================== INTERFAZ: MODO ADMINISTRADOR ====================
  if (modoAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-700">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">⚓ Dashboard de Control</h1>
              <p className="text-slate-400 text-sm">Métricas de Rendimiento - Marina Mercante</p>
            </div>
            <button 
              onClick={() => setModoAdmin(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all"
            >
              Ver Vista Encuesta
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-xl text-white max-w-xs">
            <p className="text-sm font-bold uppercase tracking-wider opacity-70">Total Encuestas</p>
            <p className="text-5xl font-black mt-2">{stats.total}</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-700">
            <h3 className="text-lg font-bold mb-6 text-white">Promedio de Satisfacción por Criterio (Escala 1-5)</h3>
            <div className="w-full h-80 min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <BarChart data={stats.promedios} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 5]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="Promedio" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== INTERFAZ: AGRADECIMIENTO ====================
  if (enviado) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-center p-6 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-sm relative">
          <div className="text-6xl mb-4">⚓</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Evaluación Registrada!</h2>
          <p className="text-slate-500 mb-4">Este dispositivo ya envió sus respuestas. ¡Gracias!</p>
          <button 
            onClick={() => setModoAdmin(true)} 
            className="text-xs text-slate-300 absolute bottom-2 right-4 hover:text-blue-500"
          >
            ⚙️ Admin
          </button>
        </div>
      </div>
    );
  }

  // ==================== INTERFAZ: FLUJO NORMAL ENCUESTA ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 font-sans relative">
      
      {/* Botón de acceso directo al Dashboard */}
      <button 
        onClick={() => setModoAdmin(true)}
        className="absolute top-4 right-4 text-white/30 hover:text-white text-xs bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm"
      >
        Panel de Control ⚙️
      </button>

      {/* FASE 0: PORTADA */}
      {faseActual === 0 && (
        <div className="bg-white/10 backdrop-blur-lg w-full max-w-lg rounded-[2.5rem] p-10 text-center border border-white/20 shadow-2xl transition-all">
          <div className="text-8xl mb-6">⚓</div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight uppercase">Sistema de Encuestas</h1>
          <p className="text-blue-100 text-lg mb-10 leading-relaxed">
            Mejora continua para <span className="font-bold text-white text-xl">Marina Mercante</span>.
          </p>
          <button onClick={() => setFaseActual(1)} className="bg-white text-blue-900 px-10 py-5 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-all w-full">
            COMENZAR →
          </button>
        </div>
      )}

      {/* FASE 1: INSTRUCCIONES */}
      {faseActual === 1 && (
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Instrucciones</h2>
          <p className="text-slate-500 mb-8 font-medium">Califica del 1 al 5 según tu experiencia:</p>

          <div className="relative h-24 mb-10 bg-slate-50 rounded-3xl p-4 border border-slate-100 overflow-hidden">
            <div className="flex justify-between h-3 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 mt-10">
               {[1, 2, 3, 4, 5].map(n => <div key={n} className="text-[10px] font-bold text-slate-400 mt-4">{n}</div>)}
            </div>
            <div className="absolute top-2 left-0 w-full px-4 animate-bounce-horizontal">
                <div className="flex flex-col items-center w-fit">
                  <span className="text-[10px] font-bold bg-slate-800 text-white px-2 py-0.5 rounded-full mb-1 whitespace-nowrap">Tu Opinión</span>
                  <span className="text-xl">↓</span>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
              <span className="block text-2xl mb-1">😡</span>
              <span className="font-bold text-red-700">1 - Pésimo</span>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
              <span className="block text-2xl mb-1">🤩</span>
              <span className="font-bold text-green-700">5 - Excelente</span>
            </div>
          </div>

          <button onClick={() => setFaseActual(2)} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 transition-all">
            ¡LO TENGO!
          </button>
        </div>
      )}

      {/* FASE 2: FORMULARIO PASO A PASO */}
      {faseActual === 2 && (
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 md:p-12 transition-all">
          <div className="w-full bg-gray-100 h-2 mb-10 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-700 ease-out"
              style={{ width: `${((pasoActual + 1) / (preguntas.length + 1)) * 100}%` }}
            ></div>
          </div>

          {pasoActual < preguntas.length ? (
            <div className="space-y-10">
              <div className="space-y-3">
                <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em]">
                  Pregunta {pasoActual + 1} de {preguntas.length}
                </p>
                <h2 className="text-3xl font-extrabold text-slate-800 leading-tight">
                  {preguntas[pasoActual].label}
                </h2>
              </div>

              <div className="flex justify-between items-center gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, [preguntas[pasoActual].id]: num });
                      setTimeout(() => setPasoActual(pasoActual + 1), 400);
                    }}
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl text-xl font-bold transition-all ${
                      formData[preguntas[pasoActual].id] === num
                      ? 'bg-blue-600 text-white scale-110 shadow-xl'
                      : 'bg-slate-50 text-slate-400 hover:bg-white hover:shadow-md border border-transparent'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setPasoActual(pasoActual - 1)} 
                disabled={pasoActual === 0}
                className="text-slate-400 text-sm font-medium hover:text-blue-600 disabled:opacity-0 transition-opacity"
              >
                ← Volver
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-black text-slate-800">¡Casi listo!</h2>
                <p className="text-slate-500">Confirma tu área para finalizar.</p>
              </div>
              
              <div className="space-y-4">
                {cargandoDepartamentos ? (
                  <div className="w-full space-y-3 animate-pulse bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="h-5 bg-slate-200 rounded-md w-1/3"></div>
                    <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
                  </div>
                ) : errorDepartamentos ? (
                  <div className="p-4 bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 text-sm text-center">
                    ⚠️ Error al conectar con el servidor.
                  </div>
                ) : (
                  <select 
                    className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none transition-all text-slate-700 font-bold"
                    value={formData.departamento_id}
                    onChange={(e) => setFormData({...formData, departamento_id: e.target.value})}
                  >
                    <option value="">Selecciona tu departamento...</option>
                    {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                  </select>
                )}

                <textarea 
                  placeholder="¿Comentarios? (Opcional)"
                  className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none transition-all text-slate-700 min-h-[100px]"
                  value={formData.comentarios}
                  onChange={(e) => setFormData({...formData, comentarios: e.target.value})}
                ></textarea>
              </div>

              {errorEnvioEncuesta && (
                <p className="text-red-500 text-sm font-semibold text-center">{errorEnvioEncuesta}</p>
              )}

              <button 
                onClick={handleSubmit}
                disabled={enviandoEncuesta || cargandoDepartamentos || errorDepartamentos}
                className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-lg shadow-2xl hover:bg-black transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {enviandoEncuesta ? "ENVIANDO..." : "ENVIAR EVALUACIÓN"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;