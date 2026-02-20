"use client";

import React, { useState } from 'react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { Vidrio } from '@/types';

// Agregamos cantidadCargada a las propiedades
export default function UploaderPrecios({
  alCargarPrecios,
  cantidadCargada
}: {
  alCargarPrecios: (datos: Vidrio[]) => void,
  cantidadCargada: number
}) {
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const descargarPlantilla = () => {
    // ... (Tu código de descargar plantilla queda igual)
    const encabezados = ["tipo", "espesor", "precio_m2"];
    const ejemplo = ["Float Incoloro", "4mm", "15000"];
    const contenidoCsv = [encabezados, ejemplo].map(e => e.join(";")).join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + contenidoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "plantilla_precios.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const manejarSubida = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    setError(null);
    setExito(false);

    if (!archivo) return;

    if (archivo.type !== 'text/csv' && !archivo.name.endsWith('.csv')) {
      setError("Por seguridad, solo se permiten archivos con formato .csv");
      return;
    }

    Papa.parse(archivo, {
      header: true,
      skipEmptyLines: true,

      // NUEVO: Filtro de Ciberseguridad/Sanitización para limpiar los títulos
      transformHeader: (header) => {
        return header
          .toLowerCase() // Pasa todo a minúscula (por si dice "Tipo" o "TIPO")
          .trim()        // Borra espacios en blanco al principio y al final
          .replace(/^\uFEFF/, ''); // Destruye el carácter invisible (BOM) de Excel/WhatsApp
      },

      complete: (resultados) => {
        // Validación de encabezados
        const headers = resultados.meta.fields || [];
        const required = ["tipo", "espesor", "precio_m2"];
        const missing = required.filter(h => !headers.includes(h));

        if (missing.length > 0) {
          const msg = `El CSV no tiene el formato correcto. Faltan columnas: ${missing.join(", ")}`;
          setError(msg);
          toast.error(msg);
          return;
        }

        if (alCargarPrecios) alCargarPrecios(resultados.data as Vidrio[]);
        setExito(true);
        toast.success("Lista de precios actualizada");
      },
      error: (err) => {
        setError("Error al leer: " + err.message);
        toast.error("Error al cargar los precios");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        {/* INDICADOR PERMANENTE DE MEMORIA */}
        {cantidadCargada > 0 ? (
          <span className="text-xs font-bold bg-green-100 text-green-800 py-1 px-2 rounded-md border border-green-200 shadow-sm">
            ✅ {cantidadCargada} precios en memoria
          </span>
        ) : (
          <span className="text-xs font-bold bg-amber-100 text-amber-800 py-1 px-2 rounded-md border border-amber-200">
            ⚠️ Memoria vacía
          </span>
        )}

        <button onClick={descargarPlantilla} className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline">
          Descargar plantilla Excel
        </button>
      </div>

      <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center hover:bg-slate-50 transition-colors">
        <span className="text-sm font-medium text-slate-700 mb-3 text-center">Actualizar lista de precios (CSV)</span>
        <input
          type="file"
          accept=".csv"
          onChange={manejarSubida}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer text-center"
        />
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">{error}</div>}
      {exito && <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200 text-center font-medium">¡Lista actualizada correctamente!</div>}
    </div>
  );
}