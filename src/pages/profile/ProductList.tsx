// TODO: List products
// - [ ] Send request
// - [ ] List of products with pagination
// - [ ] UI
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Product = {
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

type ApiResponse = {
  content: Product[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

type Props = {
  page_size: number;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  // const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1); // Initialize totalPages

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/products?page=${page}&size=2`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: ApiResponse = await response.json();
        setProducts(data.content);
        // setTotalCount(data.page.totalElements);
        setTotalPages(data.page.totalPages); // Set totalPages from response
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchData();
  }, [page]);

  // const pageCount = Math.ceil(totalCount / page_size); // No longer needed

  return (
    <>
      <Table>
        <TableCaption>Your products</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Sizes</TableHead>
            <TableHead>Colors</TableHead>
            <TableHead>Series</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.productId}>
              <TableCell className="font-medium">{product.productId}</TableCell>
              <TableCell>{product.productName}</TableCell>
              <TableCell>{product.productDescription}</TableCell>
              <TableCell>{product.categoryName}</TableCell>
              <TableCell>{product.sizes}</TableCell>
              <TableCell>{product.colors}</TableCell>
              <TableCell>{product.seriesName}</TableCell>
              <TableCell>{product.productStock}</TableCell>
              <TableCell className="text-right">${product.productPrice}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => setPage(Math.max(0, page - 1))}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i).map((index) => (
            <PaginationItem key={index}>
              <PaginationLink
                href="#"
                isActive={index === page}
                onClick={() => setPage(index)}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}
