import { useTokenDetails } from "@/components/utils";
import { useEffect, useState } from "react";
import { OrderTable } from "./orderTableColumns";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface Orders {
  userId: number;
  productId: number;
  quantity: number;
  orderAmount: number;
  orderStatus: string;
  productName: string;
  category: string;
  series: string;
}
interface OrdersPage {
  content: Orders[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  }
}

export default function Orders() {
  const { token, decodedToken } = useTokenDetails();
  const fetchCustomerOrders = async (): Promise<OrdersPage> => {
    try {
      const response = await fetch(
        `http://localhost:8080/customer/myorders/${decodedToken.id}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json", // Or the appropriate content type
          },
        },
      );

      if (!response.ok) {
        // Handle non-2xx responses (e.g., 404, 500)
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: OrdersPage = await response.json(); // Or response.text() if it's not JSON
      return data;
    } catch (error) {
      // Handle network errors, JSON parsing errors, etc.
      console.error("Fetch error:", error);
      throw error; // Re-throw to allow the calling code to handle it
    }
  };

  const [custOrders, setCustOrders] = useState<OrdersPage>();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchCustomerOrders()
      .then((orders) => {
        setCustOrders(orders);
        setTotalPages(orders.page.totalPages);
      })
      .catch((error) => {
        // Handle the error (e.g., display an error message to the user)
        console.error("Failed to fetch customer orders:", error);
      });
  }, [page])

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 m-2">{decodedToken.sub}'s Order Status</h3>
      <OrderTable custOrders={custOrders} />
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
    </div>
  )
}

