export interface Vidrio {
  tipo: string;
  espesor: string;
  precio_m2: string;
}

export interface ItemPedido {
  id: number;
  detalle: string;
  subtotal: number;
}
