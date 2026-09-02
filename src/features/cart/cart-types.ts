export type CartAvailability = 'por-confirmar' | 'en-stock' | 'sobre-pedido' | 'agotado';

export interface CartProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  image: string;
  price: number;
  stock: number | null;
  availability: CartAvailability;
}

export interface CartItem extends CartProduct {
  quantity: number;
}
