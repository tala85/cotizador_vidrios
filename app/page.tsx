"use client";

import { useState, useEffect } from 'react';
import UploaderPrecios from '@/components/UploaderPrecios';
import PanelCotizador from '@/components/PanelCotizador';
import ThemeToggle from '@/components/ThemeToggle';
import { Vidrio } from '@/types';

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEstaMontado(true);
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
  }, []);

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
      const iconSelectors = ["link[rel='icon']", "link[rel='shortcut icon']", "link[rel='apple-touch-icon']"];
      let found = false;

      iconSelectors.forEach(selector => {
        const link = document.querySelector(selector);
        if (link) {
          link.setAttribute("href", logoBase64);
          found = true;
        }
      });

      if (!found) {
        const newIcon = document.createElement("link");
        newIcon.setAttribute("rel", "icon");
        newIcon.setAttribute("href", logoBase64);
        document.head.appendChild(newIcon);
      }
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
              <p className="text-sm md:text-base text-app-muted mt-1 font-medium">Sistema de Gestión y Presupuestos</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-app-muted uppercase tracking-widest">Modo de Pantalla</span>
            <ThemeToggle />
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
                  <label className="text-xs font-bold text-slate-600">Margen Ganancia (%)</label>
                  <input
                    type="number" value={margenGanancia} onFocus={(e) => e.target.select()}
                    onChange={(e) => { const val = e.target.value; setMargenGanancia(val); localStorage.setItem('vidrieria_margen', val); }}
                    className="p-2 border border-slate-300 rounded-md text-slate-800 font-bold w-full"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full sm:w-1/2">
                  <label className="text-xs font-bold text-slate-600">Extra Colocación (%)</label>
                  <input
                    type="number" value={costoColocacion} onFocus={(e) => e.target.select()}
                    onChange={(e) => { const val = e.target.value; setCostoColocacion(val); localStorage.setItem('vidrieria_colocacion', val); }}
                    className="p-2 border border-slate-300 rounded-md text-slate-800 font-bold w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <div className="flex flex-col gap-1 w-full sm:w-1/2">
                  <label className="text-xs font-bold text-slate-600">IVA (%)</label>
                  <input
                    type="number" value={porcentajeIva} onFocus={(e) => e.target.select()}
                    onChange={(e) => { const val = e.target.value; setPorcentajeIva(val); localStorage.setItem('vidrieria_iva', val); }}
                    className="p-2 border border-slate-300 rounded-md text-slate-800 font-bold w-full"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full sm:w-1/2">
                  <label className="text-xs font-bold text-slate-600">IIBB (%)</label>
                  <input
                    type="number" value={porcentajeIibb} onFocus={(e) => e.target.select()}
                    onChange={(e) => { const val = e.target.value; setPorcentajeIibb(val); localStorage.setItem('vidrieria_iibb', val); }}
                    className="p-2 border border-slate-300 rounded-md text-slate-800 font-bold w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 bg-app-card p-4 border border-app rounded-lg shadow-sm border-l-4 border-l-blue-500">
              <h3 className="font-bold text-app-foreground text-xs md:text-sm uppercase">2. Marca y Diseño</h3>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-app-muted">Nombre de la Vidriería</label>
                <input
                  type="text" value={nombreNegocio} onChange={manejarCambioNombre}
                  className="p-2 border border-app rounded-md bg-app-muted text-app-foreground font-semibold w-full"
                />
              </div>
              <div className="flex flex-col gap-2 w-full overflow-hidden">
                <label className="text-xs font-bold text-slate-600">Logo (JPG, PNG)</label>
                <input
                  type="file" accept="image/png, image/jpeg" onChange={manejarCambioLogo}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-3 mt-1">
                <label className="text-xs font-bold text-slate-600">Color de Fondo:</label>
                <input
                  type="color" value={colorFondo}
                  onChange={(e) => { setColorFondo(e.target.value); localStorage.setItem('vidrieria_color', e.target.value); }}
                  className="h-8 w-8 md:h-10 md:w-10 cursor-pointer rounded-md border-0 p-0 shadow-sm shrink-0"
                />
              </div>
            </div>

            <div className="bg-app-card p-4 border border-app rounded-lg shadow-sm border-l-4 border-l-slate-500">
              <h3 className="font-bold text-app-foreground text-xs md:text-sm uppercase mb-3">3. Lista de Costos</h3>
              <UploaderPrecios alCargarPrecios={manejarCargaPrecios} cantidadCargada={listaPrecios.length} />
            </div>

          </section>
        </div>
      </div>
    </main>
  );
}