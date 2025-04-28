import { token, tokenDetails } from "@/components/utils";
import { useEffect, useState } from "react";
import { OrderTable } from "./orderTableColumns";

export default function Orders() {
  const fetchCustomerOrders = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/customer/myorders/${tokenDetails().id}`,
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

      const data = await response.json(); // Or response.text() if it's not JSON
      return data;
    } catch (error) {
      // Handle network errors, JSON parsing errors, etc.
      console.error("Fetch error:", error);
      throw error; // Re-throw to allow the calling code to handle it
    }
  };

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
  const [custOrders, setCustOrders] = useState<OrdersPage>();

  useEffect(() => {
    fetchCustomerOrders()
      .then((orders) => {
        setCustOrders(orders);
      })
      .catch((error) => {
        // Handle the error (e.g., display an error message to the user)
        console.error("Failed to fetch customer orders:", error);
      });
  }, [])


  return (
    <div>
      <OrderTable custOrders={custOrders} />
    </div>
  )
}

