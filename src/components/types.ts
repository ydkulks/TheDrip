export type Product = {
  productId: number;
  productName: string;
  productDescription: string;
  productPrice: number;
  productStock: number;
  seriesName: string;
  categoryName: string;
  sellerName: string;
  images: string[];
  sizes: string[];
  colors: string[];
};

export type ApiResponse = {
  content: Product[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

type Cart = {
  cart_id: number;
  user: string;
}

type CartProduct = {
  productId: number;
  productName: string;
  category: string;
  series: string;
  image: string;
  price: number;
}

type CartItem = {
  cart_items_id: number;
  cart: Cart;
  product: CartProduct;
  quantity: number;
  color: string;
  size: string;
}

export type CartResponse = {
  content: CartItem[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  total: number;
};
