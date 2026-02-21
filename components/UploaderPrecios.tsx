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
          <span className="text-xs font-bold bg-green-500/20 text-green-600 py-1 px-2 rounded-md border border-green-500/30 shadow-sm">
            ✅ {cantidadCargada} precios en memoria
          </span>
        ) : (
          <span className="text-xs font-bold bg-amber-500/20 text-amber-600 py-1 px-2 rounded-md border border-amber-500/30">
            ⚠️ Memoria vacía
          </span>
        )}

        <button onClick={descargarPlantilla} className="text-xs font-semibold text-app-accent hover:underline">
          Descargar plantilla Excel
        </button>
      </div>

      <div className="p-4 border-2 border-dashed border-app rounded-lg flex flex-col items-center justify-center hover:bg-app-muted transition-colors">
        <span className="text-sm font-medium text-app-foreground mb-3 text-center">Actualizar lista de precios (CSV)</span>
        <input
          type="file"
          accept=".csv"
          onChange={manejarSubida}
          className="block w-full text-sm text-app-muted-fg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-app-muted file:text-app-foreground hover:file:bg-app-card cursor-pointer text-center"
        />
      </div>

      {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-md text-sm border border-red-500/20">{error}</div>}
      {exito && <div className="bg-green-500/10 text-green-500 p-3 rounded-md text-sm border border-green-500/20 text-center font-medium">¡Lista actualizada correctamente!</div>}
    </div>
  );
}