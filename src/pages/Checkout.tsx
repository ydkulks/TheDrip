import { useEffect } from "react"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom"
import { CartProducts, CheckoutPageProps } from "@/components/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type CheckoutResponse = {
  url: string;
}

async function createCheckoutSession(products: CartProducts[], cartId: number[]): Promise<CheckoutResponse | null> {
  const token = localStorage.getItem("token");
  if (products != null) {
    const data = {
      "successUrl": "http://localhost:5173/checkout/success",
      "cancelUrl": "http://localhost:5173/checkout/cancel",
      "products": products,
      "cartItemsId": cartId,
    }
    // WARN: Backend URL
    const response = await fetch(
      'http://localhost:8080/api/stripe/create-checkout-session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status}`,
      );
    }

    return response.json();
  }
  return null;
}

export default function CheckoutPage() {
  const location = useLocation()
  const props: CheckoutPageProps = location.state ? location.state : localStorage.getItem("checkout");
  const products: CartProducts[] | null = props.products
  const cartIds: number[] = props.cartItemIds


  useEffect(() => {
    localStorage.setItem("checkout", JSON.stringify(props));
    createCheckoutSession(products, cartIds)
      .then(response => {
        if (response != null) {
          window.location.href = response.url;
        }
        // console.log(response.url);
      });
  }, [props])

  return (
    <div className="container mx-auto mb-5 px-4">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {(products == null) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Products Found</AlertTitle>
          <AlertDescription>
            You have no products to checkout. Go back to
            <Link to="/cart"><Button variant="outline">cart</Button></Link>
            and select product to checkout.
          </AlertDescription>
        </Alert>
      )}

      {(products != null) && (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Stripe Checkout</AlertTitle>
          <AlertDescription>
            <p>Redirecting you to stripe checkout...</p>
            <p>Not being redirected? Try refreshing the page.</p>
          </AlertDescription>
        </Alert>
      )}

    </div>
  )
}
