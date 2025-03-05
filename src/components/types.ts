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
