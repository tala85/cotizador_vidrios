"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Vidrio, ItemPedido } from '@/types';
import { calcularPrecioItem, calcularTotales, formatearMoneda } from '@/lib/utils';

export default function PanelCotizador({
  precios,
  margen,
  porcentajeColocacion,
  porcentajeIva,
  porcentajeIibb,
  nombreNegocio,
  logoBase64
}: {
  precios: Vidrio[],
  margen: number | string,
  porcentajeColocacion: number | string,
  porcentajeIva: number | string,
  porcentajeIibb: number | string,
  nombreNegocio?: string,
  logoBase64?: string | null
}) {
  const [ancho, setAncho] = useState("");
  const [alto, setAlto] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [vidrioSeleccionado, setVidrioSeleccionado] = useState("");
  const [busquedaVidrio, setBusquedaVidrio] = useState("");
  const [conColocacion, setConColocacion] = useState(false);
  const [resultado, setResultado] = useState<number | null>(null);

  const [nombreCliente, setNombreCliente] = useState("");
  const [contactoCliente, setContactoCliente] = useState("");

  const [listaPedido, setListaPedido] = useState<ItemPedido[]>([]);

  const [numeroPresupuesto, setNumeroPresupuesto] = useState("");

  useEffect(() => {
    setNumeroPresupuesto(Date.now().toString().slice(-6));
    const pedidoGuardado = localStorage.getItem('vidrieria_pedido');
    if (pedidoGuardado) setListaPedido(JSON.parse(pedidoGuardado));
  }, []);

  useEffect(() => {
    localStorage.setItem('vidrieria_pedido', JSON.stringify(listaPedido));
  }, [listaPedido]);

  const calcular = () => {
    const [tipoSel, espesorSel] = vidrioSeleccionado.split('|');
    const datosVidrio = precios.find(v => v.tipo === tipoSel && v.espesor === espesorSel);

    if (datosVidrio && ancho && alto && cantidad) {
      const precio = calcularPrecioItem(
        datosVidrio.precio_m2,
        margen,
        porcentajeColocacion,
        ancho,
        alto,
        cantidad,
        conColocacion
      );
      setResultado(precio);
    }
  };

  const agregarAlPedido = () => {
    if (resultado !== null && vidrioSeleccionado) {
      const [tipoSel, espesorSel] = vidrioSeleccionado.split('|');
      const etiquetaColocacion = conColocacion ? ' [Con Colocación]' : '';

      const nuevoItem: ItemPedido = {
        id: Date.now(),
        detalle: `${cantidad} un. de ${ancho}m x ${alto}m - ${tipoSel} (${espesorSel})${etiquetaColocacion}`,
        subtotal: resultado
      };
      setListaPedido([...listaPedido, nuevoItem]);
      toast.success("Item agregado al pedido");

      setAncho("");
      setAlto("");
      setCantidad("1");
      setConColocacion(false);
      setResultado(null);
    }
  };

  const eliminarItem = (id: number) => {
    setListaPedido(listaPedido.filter(item => item.id !== id));
  };

  // ESTA ES LA MAGIA: Imprime el documento usando el navegador
  const exportarPDF = () => {
    window.print();
  };

  const { subtotalNeto, iva, iibb, totalFinal } = calcularTotales(
    listaPedido,
    porcentajeIva,
    porcentajeIibb
  );
  const fechaHoy = new Date().toLocaleDateString('es-AR');

  return (
    <div className="flex flex-col gap-6">

      {/* Todo este formulario lleva "print:hidden" para que no salga en el PDF */}
      <div className="bg-app-card p-5 rounded-lg border border-app shadow-sm flex flex-col gap-4 print:hidden">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-app-muted-fg">Tipo de Vidrio</label>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Buscar vidrio..."
              value={busquedaVidrio}
              onChange={(e) => setBusquedaVidrio(e.target.value)}
              className="p-2 text-sm border border-app rounded-md bg-app-muted text-app-foreground focus:bg-app-card transition-colors"
            />
            <select
              className="p-3 border border-app rounded-md bg-app-card text-app-foreground font-medium"
              value={vidrioSeleccionado} onChange={(e) => setVidrioSeleccionado(e.target.value)}
            >
              <option value="">Seleccioná un vidrio...</option>
              {precios
                .filter(v =>
                  v.tipo.toLowerCase().includes(busquedaVidrio.toLowerCase()) ||
                  v.espesor.toLowerCase().includes(busquedaVidrio.toLowerCase())
                )
                .map((v, i) => (
                  <option key={i} value={`${v.tipo}|${v.espesor}`}>{v.tipo} ({v.espesor})</option>
                ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-app-muted-fg">Ancho (m)</label>
            <input
              type="number" step="0.01" placeholder="0.00" value={ancho} onFocus={(e) => e.target.select()}
              className="p-3 border border-app rounded-md bg-app-card text-app-foreground w-full" onChange={(e) => setAncho(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-app-muted-fg">Alto (m)</label>
            <input
              type="number" step="0.01" placeholder="0.00" value={alto} onFocus={(e) => e.target.select()}
              className="p-3 border border-app rounded-md bg-app-card text-app-foreground w-full" onChange={(e) => setAlto(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-app-muted-fg">Cant.</label>
            <input
              type="number" min="1" value={cantidad} onFocus={(e) => e.target.select()}
              className="p-3 border border-app rounded-md bg-app-card text-app-foreground font-bold w-full" onChange={(e) => setCantidad(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 p-3 bg-app-muted border border-app rounded-md">
          <input
            type="checkbox" id="colocacionCheck" checked={conColocacion} onChange={(e) => setConColocacion(e.target.checked)}
            className="w-5 h-5 cursor-pointer accent-blue-600 shrink-0"
          />
          <label htmlFor="colocacionCheck" className="text-sm font-bold text-app-foreground cursor-pointer select-none">
            Incluir servicio de Colocación (+{porcentajeColocacion}%)
          </label>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        <button onClick={calcular} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md w-full">
          Calcular Subtotal
        </button>
        {resultado !== null && (
          <button onClick={agregarAlPedido} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md animate-pulse w-full">
            Agregar al Pedido
          </button>
        )}
      </div>

      {resultado !== null && (
        <div className="p-4 bg-app-card border border-app rounded-lg text-center shadow-inner print:hidden">
          <p className="text-app-foreground font-bold text-lg">Subtotal ítem: {formatearMoneda(resultado)}</p>
        </div>
      )}

      {/* ---------------- RESUMEN Y PDF ---------------- */}
      {listaPedido.length > 0 && (
        <div className="mt-6 border-t border-app pt-6 flex flex-col gap-4 print:border-none print:pt-0 print:mt-0">

          <div className="flex flex-col sm:flex-row justify-between items-end gap-4 print:hidden">
            <div className="flex flex-col gap-4 w-full sm:w-2/3">
              <h3 className="font-bold text-app-foreground text-lg">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-app-muted-fg uppercase">Nombre / Razón Social</label>
                  <input
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                    className="p-2 border border-app bg-app-card text-app-foreground rounded-md text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-app-muted-fg uppercase">Teléfono / Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej: 3764-123456"
                    value={contactoCliente}
                    onChange={(e) => setContactoCliente(e.target.value)}
                    className="p-2 border border-app bg-app-card text-app-foreground rounded-md text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={exportarPDF}
              className="py-2 px-6 rounded-lg font-bold shadow-md text-white transition-colors flex items-center gap-2 bg-red-600 hover:bg-red-700"
            >
              📄 Descargar Presupuesto PDF
            </button>
          </div>

          {/* CONTENEDOR PRINCIPAL DEL PDF */}
          <div id="hoja-presupuesto" className="bg-app-card border border-app rounded-lg shadow-sm overflow-hidden w-full p-0 sm:p-0 print:shadow-none print:border-none print:m-0 print:p-0 print:bg-white">

            <div className="p-6 md:p-8 border-b border-app bg-app-muted flex justify-between items-start print:bg-transparent print:border-b-2 print:border-slate-800 print:px-0">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {logoBase64 && <img src={logoBase64} alt="Logo" className="h-16 w-auto object-contain" />}
                <div>
                  <h2 className="text-2xl font-black text-app-foreground uppercase tracking-tight print:text-slate-900">{nombreNegocio}</h2>
                  <p className="text-app-muted-fg font-medium text-sm print:text-slate-500">Presupuesto Oficial</p>
                </div>
              </div>
              <div className="text-right flex flex-col gap-1">
            <div className="bg-app-foreground text-app-card px-3 py-1 rounded text-xs font-bold uppercase tracking-widest print:bg-transparent print:text-slate-900 print:p-0">
                  Presupuesto N° {numeroPresupuesto}
                </div>
            <p className="text-app-muted-fg text-xs font-bold uppercase mt-2 print:text-slate-500">Fecha Emisión</p>
            <p className="text-app-foreground font-mono font-bold text-sm print:text-slate-900">{fechaHoy}</p>
              </div>
            </div>

            {(nombreCliente || contactoCliente) && (
          <div className="px-6 py-4 md:px-8 bg-app-card border-b border-app flex flex-col gap-1 print:px-0 print:bg-white print:border-slate-200">
            <p className="text-[10px] font-black text-app-muted-fg uppercase tracking-widest print:text-slate-400">Cliente</p>
                <div className="flex flex-col sm:flex-row sm:gap-8">
                  {nombreCliente && (
                <p className="text-sm font-bold text-app-foreground print:text-slate-900">
                  <span className="text-app-muted-fg font-medium mr-1 underline decoration-app print:text-slate-500 print:decoration-slate-200">Nombre:</span> {nombreCliente}
                    </p>
                  )}
                  {contactoCliente && (
                <p className="text-sm font-bold text-app-foreground print:text-slate-900">
                  <span className="text-app-muted-fg font-medium mr-1 underline decoration-app print:text-slate-500 print:decoration-slate-200">Contacto:</span> {contactoCliente}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="overflow-x-auto print:overflow-visible">
          <table className="min-w-full divide-y divide-app">
            <thead className="bg-app-card">
                  <tr>
                <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs font-bold text-app-muted-fg uppercase tracking-wider print:px-2">Detalle del Vidrio</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right text-xs font-bold text-app-muted-fg uppercase tracking-wider print:px-2">Subtotal</th>
                    {/* Ocultamos la columna de acciones en la impresión */}
                    <th className="px-4 py-3 md:px-6 md:py-4 print:hidden">Acciones</th>
                  </tr>
                </thead>
            <tbody className="divide-y divide-app">
                  {listaPedido.map((item) => (
                <tr key={item.id} className="hover:bg-app-muted transition-colors print:hover:bg-transparent">
                  <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-app-foreground font-medium print:px-2">{item.detalle}</td>
                  <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-right font-mono font-bold text-app-foreground print:px-2">
                        {formatearMoneda(item.subtotal)}
                      </td>
                      {/* Ocultamos los botones de eliminar en la impresión */}
                      <td className="px-4 py-3 md:px-6 md:py-4 text-right print:hidden">
                        <button onClick={() => eliminarItem(item.id)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wide">
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
            <tfoot className="bg-app-muted font-medium text-sm print:bg-transparent">
                  <tr>
                <td className="px-4 py-3 md:px-6 md:py-3 text-app-muted-fg print:px-2">Subtotal Neto</td>
                <td className="px-4 py-3 md:px-6 md:py-3 text-right text-app-foreground print:px-2">{formatearMoneda(subtotalNeto)}</td>
                    <td className="print:hidden"></td>
                  </tr>
                  <tr>
                <td className="px-4 py-3 md:px-6 md:py-3 text-app-muted-fg print:px-2 print:text-slate-500">IVA ({porcentajeIva}%)</td>
                    <td className="px-4 py-3 md:px-6 md:py-3 text-right text-red-500 font-bold print:px-2">{formatearMoneda(iva)}</td>
                    <td className="print:hidden"></td>
                  </tr>
                  <tr>
                <td className="px-4 py-3 md:px-6 md:py-3 text-app-muted-fg print:px-2 print:text-slate-500">IIBB ({porcentajeIibb}%)</td>
                    <td className="px-4 py-3 md:px-6 md:py-3 text-right text-red-500 font-bold print:px-2">{formatearMoneda(iibb)}</td>
                    <td className="print:hidden"></td>
                  </tr>
                  <tr className="bg-app-foreground text-app-card print:bg-transparent print:text-slate-900 print:border-t-2 print:border-slate-800">
                    <td className="px-4 py-4 md:px-6 md:py-5 font-black text-lg print:px-2 print:py-2">TOTAL PRESUPUESTO</td>
                    <td className="px-4 py-4 md:px-6 md:py-5 text-right font-black text-2xl print:px-2 print:py-2">
                      {formatearMoneda(totalFinal)}
                    </td>
                    <td className="print:hidden"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

        <div className="p-6 md:p-8 border-t border-app bg-app-card print:bg-white print:border-t-2 print:border-slate-100 print:mt-4 print:p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="text-left">
                  <p className="text-[10px] font-bold text-app-muted-fg uppercase tracking-widest mb-1 print:text-slate-400">Términos y Condiciones</p>
                  <p className="text-[10px] text-app-muted-fg italic leading-relaxed print:text-slate-500">
                    * Los precios aquí detallados están sujetos a modificaciones sin previo aviso.<br />
                    * Presupuesto válido por 7 días corridos.<br />
                    * El servicio de colocación incluye garantía de 3 meses.
                  </p>
                </div>
                <div className="text-center md:text-right flex flex-col items-center md:items-end justify-center">
                   <div className="w-32 h-px bg-app-border mb-2 mt-4 print:mt-8 print:bg-slate-300"></div>
                   <p className="text-[10px] font-bold text-app-muted-fg uppercase print:text-slate-400">Firma y Sello</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}