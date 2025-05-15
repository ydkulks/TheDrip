export type Product = {
  productId: number;
  productName: string;
  productDescription: string;
  productPrice: number;
  productStock: number;
  seriesName: string;
  categoryName: string;
  sellerName: string;
  sellerId: number;
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

export type CartProducts = {
  productId: number;
  qty: number;
}
export interface CheckoutPageProps {
  products: CartProducts[];
  cartItemIds: number[];
}

export enum Role {
  CUSTOMER = "Customer",
  ADMIN = "Admin",
  SELLER = "Seller"
}

export type PaginationType = {
  sort: string;
  // sortBy?: string;
  // sortDirection?: string;
  page?: number;
  size?: number;
}
export type UserModel = {
  id: number;
  email: string;
  username: string;
  role: Role;
  passwordResetRequired: boolean;
  created: string;
  updated: string;
}
export type Users = {
  content: UserModel[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};
