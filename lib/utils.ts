export const formatearMoneda = (valor: number) => {
  return valor.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const calcularPrecioItem = (
  precioM2Costo: string,
  margen: number | string,
  porcentajeColocacion: number | string,
  ancho: string,
  alto: string,
  cantidad: string,
  conColocacion: boolean
): number => {
  const precioCostoLimpio = parseFloat(
    precioM2Costo.replace(/[$. ]/g, '').replace(',', '.')
  );
  const margenNum = Number(margen) || 0;
  const colNum = Number(porcentajeColocacion) || 0;

  const precioVentaM2 = precioCostoLimpio * (1 + margenNum / 100);
  const factorColocacion = conColocacion ? 1 + colNum / 100 : 1;
  const precioFinalM2 = precioVentaM2 * factorColocacion;

  const m2Totales = parseFloat(ancho) * parseFloat(alto) * parseInt(cantidad);

  return m2Totales * precioFinalM2;
};

export const calcularTotales = (
  listaPedido: { subtotal: number }[],
  porcentajeIva: number | string = 21,
  porcentajeIibb: number | string = 5
) => {
  const subtotalNeto = listaPedido.reduce((acc, item) => acc + item.subtotal, 0);
  const iva = subtotalNeto * (Number(porcentajeIva) / 100);
  const subtotalConIva = subtotalNeto + iva;
  const iibb = subtotalConIva * (Number(porcentajeIibb) / 100);
  const totalFinal = subtotalConIva + iibb;

  return {
    subtotalNeto,
    iva,
    iibb,
    totalFinal,
  };
};
