"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import UploaderPrecios from '@/components/UploaderPrecios';
import PanelCotizador from '@/components/PanelCotizador';
import ThemeToggle from '@/components/ThemeToggle';
import { Vidrio } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export default function Home() {
  const [listaPrecios, setListaPrecios] = useState<Vidrio[]>([]);
  const [nombreNegocio, setNombreNegocio] = useState("Vidriería Misiones");
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [colorFondo, setColorFondo] = useState("#f1f5f9");

  const [margenGanancia, setMargenGanancia] = useState<number | string>(50);
  const [costoColocacion, setCostoColocacion] = useState<number | string>(30);
  const [porcentajeIva, setPorcentajeIva] = useState<number | string>(21);
  const [porcentajeIibb, setPorcentajeIibb] = useState<number | string>(5);

  const [estaMontado, setEstaMontado] = useState(false);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargandoSync, setCargandoSync] = useState(false);

  const cargarDesdeSupabase = useCallback(async (userId: string) => {
    try {
      setCargandoSync(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        if (data.business_name) setNombreNegocio(data.business_name);
        if (data.logo_url) setLogoBase64(data.logo_url);
        if (data.settings) {
          const s = data.settings;
          if (s.margen) setMargenGanancia(s.margen);
          if (s.colocacion) setCostoColocacion(s.colocacion);
          if (s.iva) setPorcentajeIva(s.iva);
          if (s.iibb) setPorcentajeIibb(s.iibb);
          if (s.color) setColorFondo(s.color);
        }
      }
    } catch (err) {
      console.error("Error al sincronizar con la nube:", err);
    } finally {
      setCargandoSync(false);
    }
  }, []);

  useEffect(() => {
    setEstaMontado(true);

    // Escuchar cambios de sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null);
      if (session?.user) cargarDesdeSupabase(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
      if (session?.user) cargarDesdeSupabase(session.user.id);
    });

    const preciosGuardados = localStorage.getItem('vidrieria_precios');
    const nombreGuardado = localStorage.getItem('vidrieria_nombre');
    const logoGuardado = localStorage.getItem('vidrieria_logo');
    const colorGuardado = localStorage.getItem('vidrieria_color');
    const margenGuardado = localStorage.getItem('vidrieria_margen');
    const colocacionGuardada = localStorage.getItem('vidrieria_colocacion');
    const ivaGuardado = localStorage.getItem('vidrieria_iva');
    const iibbGuardado = localStorage.getItem('vidrieria_iibb');

    if (preciosGuardados) setListaPrecios(JSON.parse(preciosGuardados));
    if (nombreGuardado) setNombreNegocio(nombreGuardado);
    if (logoGuardado) setLogoBase64(logoGuardado);
    if (colorGuardado) setColorFondo(colorGuardado);
    if (margenGuardado) setMargenGanancia(margenGuardado);
    if (colocacionGuardada) setCostoColocacion(colocacionGuardada);
    if (ivaGuardado) setPorcentajeIva(ivaGuardado);
    if (iibbGuardado) setPorcentajeIibb(iibbGuardado);

    return () => {
      subscription.unsubscribe();
    };
  }, [cargarDesdeSupabase]);

  // NUEVO: LA MAGIA DEL DOM - Actualiza la pestaña del navegador en tiempo real
  useEffect(() => {
    if (!estaMontado) return;

    // 1. Cambia el Título de la pestaña
    document.title = `${nombreNegocio} - Cotizador`;

    // 2. Cambia el color de la barra superior del navegador (en celulares)
    let metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute("content", colorFondo);

    // 3. Cambia el Favicon (el iconito de la pestaña) - Mejorado para mayor compatibilidad
    if (logoBase64) {
      // Eliminar iconos existentes para evitar conflictos (incluyendo los de Next.js)
      const existingIcons = document.querySelectorAll("link[rel*='icon']");
      existingIcons.forEach(el => el.remove());

      // Crear nuevos links para el icono
      const newIcon = document.createElement("link");
      newIcon.setAttribute("rel", "icon");
      newIcon.setAttribute("type", "image/png");
      newIcon.setAttribute("href", logoBase64);
      document.head.appendChild(newIcon);

      const appleIcon = document.createElement("link");
      appleIcon.setAttribute("rel", "apple-touch-icon");
      appleIcon.setAttribute("href", logoBase64);
      document.head.appendChild(appleIcon);

      // Forzar actualización del DOM para que el navegador lo detecte
      console.log("Favicon actualizado dinámicamente");
    }
  }, [nombreNegocio, colorFondo, logoBase64, estaMontado]);

  const manejarCargaPrecios = (datos: Vidrio[]) => {
    setListaPrecios(datos);
    localStorage.setItem('vidrieria_precios', JSON.stringify(datos));
  };

  const manejarCambioNombre = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoNombre = e.target.value;
    setNombreNegocio(nuevoNombre);
    localStorage.setItem('vidrieria_nombre', nuevoNombre);
  };

  const manejarCambioLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      if (!archivo.type.startsWith('image/')) {
         alert("Por favor subí un archivo de imagen (JPG, PNG).");
         return;
      }
      const lector = new FileReader();
      lector.onloadend = () => {
        const resultado = lector.result as string;
        setLogoBase64(resultado);
        localStorage.setItem('vidrieria_logo', resultado);
      };
      lector.readAsDataURL(archivo);
    }
  };

  const guardarEnNube = async () => {
    if (!usuario) {
      toast.error("Debes iniciar sesión para sincronizar con la nube.");
      return;
    }

    try {
      setCargandoSync(true);
      const { error } = await supabase.from('profiles').upsert({
        id: usuario.id,
        business_name: nombreNegocio,
        logo_url: logoBase64,
        settings: {
          margen: margenGanancia,
          colocacion: costoColocacion,
          iva: porcentajeIva,
          iibb: porcentajeIibb,
          color: colorFondo
        },
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success("¡Configuración guardada en la nube!");
    } catch (err) {
      toast.error("Error al guardar en la nube. Asegúrate de tener la tabla 'profiles' configurada.");
      console.error(err);
    } finally {
      setCargandoSync(false);
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    toast.success("Sesión cerrada.");
  };

  if (!estaMontado) return null;

  return (
    <main className="min-h-screen p-4 md:p-8 pb-24 transition-colors duration-300 print:bg-white print:p-0 print:m-0" style={{ backgroundColor: colorFondo }}>

      <div className="max-w-7xl mx-auto bg-app-card p-4 md:p-8 rounded-xl shadow-lg border border-app print:shadow-none print:border-none print:max-w-none print:p-0">

        <header className="border-b border-app pb-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left print:hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {logoBase64 && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logoBase64} alt="Logo" className="h-16 md:h-20 w-auto object-contain rounded-md shadow-sm" />
            )}
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-app-foreground uppercase tracking-tight">
                {nombreNegocio}
              </h1>
              <p className="text-sm md:text-base text-app-muted-fg mt-1 font-medium">Sistema de Gestión y Presupuestos</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-app-muted-fg uppercase tracking-widest">Cuenta</span>
              {usuario ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-app-foreground max-w-[100px] truncate">{usuario.email}</span>
                  <button onClick={cerrarSesion} className="text-[10px] text-red-500 hover:underline font-bold uppercase">Salir</button>
                </div>
              ) : (
                <Link href="/login" className="text-xs bg-slate-800 text-white px-3 py-1 rounded-md font-bold hover:bg-slate-900 transition-all">Ingresar</Link>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-app-muted-fg uppercase tracking-widest">Modo de Pantalla</span>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 print:block">

          <section className="lg:col-span-2 bg-app-muted p-4 md:p-6 rounded-lg border border-app print:bg-white print:border-none print:p-0 print:m-0">
            <h2 className="text-lg md:text-xl font-bold text-app-foreground mb-4 border-b border-app pb-2 print:hidden">Cotizador de vidrios</h2>
            <PanelCotizador
              precios={listaPrecios}
              margen={margenGanancia}
              porcentajeColocacion={costoColocacion}
              porcentajeIva={porcentajeIva}
              porcentajeIibb={porcentajeIibb}
              nombreNegocio={nombreNegocio}
              logoBase64={logoBase64}
            />
          </section>

          <section className="bg-app-muted p-4 md:p-6 rounded-lg border border-app flex flex-col gap-6 print:hidden">
            <h2 className="text-lg md:text-xl font-bold text-app-foreground mb-2 border-b border-app pb-2">Ajustes del Sistema</h2>

            <div className="flex flex-col gap-4 bg-app-card p-4 border border-app rounded-lg shadow-sm border-l-4 border-l-green-500">
              <h3 className="font-bold text-app-foreground text-xs md:text-sm uppercase">1. Parámetros Financieros</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-1 w-full sm:w-1/2">
                  <label className="text-xs font-bold text-app-muted-fg">Margen Ganancia (%)</label>
                  <input
                    type="number" value={margenGanancia} onFocus={(e) => e.target.select()}
                    onChange={(e) => { const val = e.target.value; setMargenGanancia(val); localStorage.setItem('vidrieria_margen', val); }}
                    className="p-2 border border-app rounded-md bg-app-card text-app-foreground font-bold w-full"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full sm:w-1/2">
                  <label className="text-xs font-bold text-app-muted-fg">Extra Colocación (%)</label>
                  <input
                    type="number" value={costoColocacion} onFocus={(e) => e.target.select()}
                    onChange={(e) => { const val = e.target.value; setCostoColocacion(val); localStorage.setItem('vidrieria_colocacion', val); }}
                    className="p-2 border border-app rounded-md bg-app-card text-app-foreground font-bold w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <div className="flex flex-col gap-1 w-full sm:w-1/2">
                  <label className="text-xs font-bold text-app-muted-fg">IVA (%)</label>
                  <input
                    type="number" value={porcentajeIva} onFocus={(e) => e.target.select()}
                    onChange={(e) => { const val = e.target.value; setPorcentajeIva(val); localStorage.setItem('vidrieria_iva', val); }}
                    className="p-2 border border-app rounded-md bg-app-card text-app-foreground font-bold w-full"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full sm:w-1/2">
                  <label className="text-xs font-bold text-app-muted-fg">IIBB (%)</label>
                  <input
                    type="number" value={porcentajeIibb} onFocus={(e) => e.target.select()}
                    onChange={(e) => { const val = e.target.value; setPorcentajeIibb(val); localStorage.setItem('vidrieria_iibb', val); }}
                    className="p-2 border border-app rounded-md bg-app-card text-app-foreground font-bold w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 bg-app-card p-4 border border-app rounded-lg shadow-sm border-l-4 border-l-blue-500">
              <h3 className="font-bold text-app-foreground text-xs md:text-sm uppercase">2. Marca y Diseño</h3>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-app-muted-fg">Nombre de la Vidriería</label>
                <input
                  type="text" value={nombreNegocio} onChange={manejarCambioNombre}
                  className="p-2 border border-app rounded-md bg-app-muted text-app-foreground font-semibold w-full"
                />
              </div>
              <div className="flex flex-col gap-2 w-full overflow-hidden">
                <label className="text-xs font-bold text-app-muted-fg">Logo (JPG, PNG)</label>
                <input
                  type="file" accept="image/png, image/jpeg" onChange={manejarCambioLogo}
                  className="block w-full text-xs text-app-muted-fg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-app-muted file:text-app-foreground hover:file:bg-app-card cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-3 mt-1">
                <label className="text-xs font-bold text-app-muted-fg">Color de Fondo:</label>
                <input
                  type="color" value={colorFondo}
                  onChange={(e) => { setColorFondo(e.target.value); localStorage.setItem('vidrieria_color', e.target.value); }}
                  className="h-8 w-8 md:h-10 md:w-10 cursor-pointer rounded-md border-0 p-0 shadow-sm shrink-0"
                />
              </div>
            </div>

            <div className="bg-app-card p-4 border border-app rounded-lg shadow-sm border-l-4 border-l-slate-500">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-app-foreground text-xs md:text-sm uppercase">3. Lista de Costos</h3>
                {usuario && (
                  <button
                    onClick={guardarEnNube}
                    disabled={cargandoSync}
                    className="text-[10px] bg-green-600 text-white px-2 py-1 rounded font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {cargandoSync ? '...' : '☁️ Sincronizar'}
                  </button>
                )}
              </div>
              <UploaderPrecios alCargarPrecios={manejarCargaPrecios} cantidadCargada={listaPrecios.length} />
            </div>

          </section>
        </div>
      </div>
    </main>
  );
}