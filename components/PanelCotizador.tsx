"use client";

import React, { useState, useEffect } from 'react';

// Interfaces
interface Vidrio {
  tipo: string;
  espesor: string;
  precio_m2: string;
}

interface ItemPedido {
  id: number;
  detalle: string;
  subtotal: number;
}

export default function PanelCotizador({ 
  precios, 
  margen, 
  porcentajeColocacion,
  nombreNegocio, 
  logoBase64     
}: { 
  precios: Vidrio[], 
  margen: number | string, 
  porcentajeColocacion: number | string,
  nombreNegocio?: string,
  logoBase64?: string | null
}) {
  const [ancho, setAncho] = useState("");
  const [alto, setAlto] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [vidrioSeleccionado, setVidrioSeleccionado] = useState("");
  const [conColocacion, setConColocacion] = useState(false);
  const [resultado, setResultado] = useState<number | null>(null);
  
  const [listaPedido, setListaPedido] = useState<ItemPedido[]>([]);

  useEffect(() => {
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
      const precioCostoLimpio = parseFloat(datosVidrio.precio_m2.replace(/[$. ]/g, '').replace(',', '.'));
      const margenNum = Number(margen) || 0;
      const colNum = Number(porcentajeColocacion) || 0;
      const precioVentaM2 = precioCostoLimpio * (1 + (margenNum / 100));
      const factorColocacion = conColocacion ? (1 + (colNum / 100)) : 1;
      const precioFinalM2 = precioVentaM2 * factorColocacion;
      const m2Totales = (parseFloat(ancho) * parseFloat(alto)) * parseInt(cantidad);
      setResultado(m2Totales * precioFinalM2);
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

  const subtotalNeto = listaPedido.reduce((acc, item) => acc + item.subtotal, 0);
  const iva = subtotalNeto * 0.21;
  const subtotalConIva = subtotalNeto + iva;
  const iibb = subtotalConIva * 0.05;
  const totalFinal = subtotalConIva + iibb;
  const fechaHoy = new Date().toLocaleDateString('es-AR');

  return (
    <div className="flex flex-col gap-6">
      
      {/* Todo este formulario lleva "print:hidden" para que no salga en el PDF */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-4 print:hidden">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-600">Tipo de Vidrio</label>
          <select 
            className="p-3 border border-slate-300 rounded-md bg-white text-slate-700 font-medium"
            value={vidrioSeleccionado} onChange={(e) => setVidrioSeleccionado(e.target.value)}
          >
            <option value="">Seleccioná un vidrio...</option>
            {precios.map((v, i) => (
              <option key={i} value={`${v.tipo}|${v.espesor}`}>{v.tipo} ({v.espesor})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-600">Ancho (m)</label>
            <input 
              type="number" step="0.01" placeholder="0.00" value={ancho} onFocus={(e) => e.target.select()}
              className="p-3 border border-slate-300 rounded-md text-slate-700 w-full" onChange={(e) => setAncho(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-600">Alto (m)</label>
            <input 
              type="number" step="0.01" placeholder="0.00" value={alto} onFocus={(e) => e.target.select()}
              className="p-3 border border-slate-300 rounded-md text-slate-700 w-full" onChange={(e) => setAlto(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-600">Cant.</label>
            <input 
              type="number" min="1" value={cantidad} onFocus={(e) => e.target.select()}
              className="p-3 border border-blue-300 rounded-md text-blue-900 font-bold bg-blue-50 w-full" onChange={(e) => setCantidad(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-md">
          <input 
            type="checkbox" id="colocacionCheck" checked={conColocacion} onChange={(e) => setConColocacion(e.target.checked)}
            className="w-5 h-5 cursor-pointer accent-blue-600 shrink-0"
          />
          <label htmlFor="colocacionCheck" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
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
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center shadow-inner print:hidden">
          <p className="text-blue-800 font-bold text-lg">Subtotal ítem: ${resultado.toLocaleString('es-AR')}</p>
        </div>
      )}

      {/* ---------------- RESUMEN Y PDF ---------------- */}
      {listaPedido.length > 0 && (
        <div className="mt-6 border-t pt-6 flex flex-col gap-4 print:border-none print:pt-0 print:mt-0">
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
            <h3 className="font-bold text-slate-700 text-lg">Resumen de la Orden</h3>
            
            <button 
              onClick={exportarPDF}
              className="py-2 px-6 rounded-lg font-bold shadow-md text-white transition-colors flex items-center gap-2 bg-red-600 hover:bg-red-700"
            >
              📄 Descargar Presupuesto PDF
            </button>
          </div>

          {/* CONTENEDOR PRINCIPAL DEL PDF */}
          <div id="hoja-presupuesto" className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden w-full p-0 sm:p-0 print:shadow-none print:border-none print:m-0 print:p-0">
            
            <div className="p-6 md:p-8 border-b border-slate-200 bg-slate-50 flex justify-between items-center print:bg-transparent print:border-b-2 print:border-slate-800 print:px-0">
              <div className="flex items-center gap-4">
                {logoBase64 && <img src={logoBase64} alt="Logo" className="h-16 w-auto object-contain" />}
                <div>
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{nombreNegocio}</h2>
                  <p className="text-slate-500 font-medium text-sm">Presupuesto Oficial</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-sm font-bold">Fecha:</p>
                <p className="text-slate-800 font-mono font-medium">{fechaHoy}</p>
              </div>
            </div>

            <div className="overflow-x-auto print:overflow-visible">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider print:px-2">Detalle del Vidrio</th>
                    <th className="px-4 py-3 md:px-6 md:py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider print:px-2">Subtotal</th>
                    {/* Ocultamos la columna de acciones en la impresión */}
                    <th className="px-4 py-3 md:px-6 md:py-4 print:hidden">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {listaPedido.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors print:hover:bg-transparent">
                      <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-slate-700 font-medium print:px-2">{item.detalle}</td>
                      <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-right font-mono font-bold text-slate-900 print:px-2">
                        ${item.subtotal.toLocaleString('es-AR')}
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
                <tfoot className="bg-slate-50 font-medium text-sm print:bg-transparent">
                  <tr>
                    <td className="px-4 py-3 md:px-6 md:py-3 text-slate-600 print:px-2">Subtotal Neto</td>
                    <td className="px-4 py-3 md:px-6 md:py-3 text-right print:px-2">${subtotalNeto.toLocaleString('es-AR')}</td>
                    <td className="print:hidden"></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 md:px-6 md:py-3 text-slate-600 print:px-2">IVA </td>
                    <td className="px-4 py-3 md:px-6 md:py-3 text-right text-red-500 print:px-2"> ${iva.toLocaleString('es-AR')}</td>
                    <td className="print:hidden"></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 md:px-6 md:py-3 text-slate-600 print:px-2">IIBB </td>
                    <td className="px-4 py-3 md:px-6 md:py-3 text-right text-red-500 print:px-2"> ${iibb.toLocaleString('es-AR')}</td>
                    <td className="print:hidden"></td>
                  </tr>
                  <tr className="bg-slate-800 text-white print:bg-transparent print:text-slate-900 print:border-t-2 print:border-slate-800">
                    <td className="px-4 py-4 md:px-6 md:py-5 font-black text-lg print:px-2 print:py-2">TOTAL PRESUPUESTO</td>
                    <td className="px-4 py-4 md:px-6 md:py-5 text-right font-black text-2xl print:px-2 print:py-2">
                      ${totalFinal.toLocaleString('es-AR')}
                    </td>
                    <td className="print:hidden"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-6 md:p-8 border-t border-slate-200 bg-white text-center print:border-t-0 print:mt-4 print:p-0">
              <p className="text-xs text-slate-500 italic">Los precios aquí detallados están sujetos a modificaciones sin previo aviso. Presupuesto válido por 7 días.</p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}