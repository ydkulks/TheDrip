import { useEffect, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Truck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { OrderStatusTracker } from "@/components/order-status-tracker"
import { token, tokenDetails } from "@/components/utils"
import { CartProducts } from "@/components/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type CheckoutResponse = {
  url: string;
}

async function createCheckoutSession(products: CartProducts[]): Promise<CheckoutResponse | null> {
  if (products != null) {
    const data = {
      "successUrl": "http://localhost:5173/checkout?status=success",
      "cancelUrl": "http://localhost:5173/checkout?status=cancel",
      "products": products
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
  const products: CartProducts[] | null = location.state as CartProducts[]
  const [searchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  const router = useNavigate()
  const [step, setStep] = useState<"redirecting" | "success" | "cancel">("redirecting")
  const [stripeURL, setStripeURL] = useState("/")


  useEffect(() => {
    if (statusParam && statusParam?.toString() === "success" || statusParam?.toString() === "cancel") {
      setStep(statusParam.toString() as "success" || "cancel")
    }
    if (step === "redirecting" && products != null) {
      createCheckoutSession(products)
        .then(response => {
          if (response != null) {
            setStripeURL(response.url);
            window.location.href = response.url;
          }
          // console.log(response.url);
        });
    }
  }, [])

  return (
    <div className="container mx-auto mb-5 px-4">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {(products == null && step === "redirecting") && (
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

      {(products != null && step === "redirecting") && (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Stripe Checkout</AlertTitle>
          <AlertDescription>
            Redirecting you to stripe checkout...If you are not being redirected, try visiting this URL
            <Link to={stripeURL}><Button variant="outline">Stripe Checkout</Button></Link>
            Or, try refreshing the page.
          </AlertDescription>
        </Alert>
      )}

      {step === "success" && (
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
              <CardDescription>Thank you for your purchase. Your order has been placed successfully.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-lg font-medium">Order #12345678</p>
                <p className="text-sm text-muted-foreground">
                  A confirmation email has been sent to {tokenDetails().email}
                </p>
              </div>

              <OrderStatusTracker />

              {/*<div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Estimated Delivery</h3>
                <p>
                  Your order is expected to arrive between <span className="font-medium">June 15-18, 2023</span>
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <MapPin size={16} className="mr-2" /> Shipping Address
                  </h3>
                  <div className="text-sm">
                    <p>John Doe</p>
                    <p>123 Main St</p>
                    <p>New York, NY 10001</p>
                    <p>United States</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <Package size={16} className="mr-2" /> Order Summary
                  </h3>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>$109.97</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>$5.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>$9.24</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>$125.20</span>
                    </div>
                  </div>
                </div>
              </div>*/}

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Need Help?</h3>
                <p className="text-sm mb-2">
                  If you have any questions about your order, please contact our customer support.
                </p>
                <div className="flex space-x-4">
                  <Button variant="outline" size="sm">
                    View Order Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Return & Exchange Policy</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  You can return or exchange items within 30 days of delivery. Items must be in original condition with
                  tags attached.
                </p>
                <Button variant="link" className="p-0 h-auto">
                  Read Full Policy
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground mr-1" />
                    <span className="text-xs text-muted-foreground">Secure Payment</span>
                  </div>
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 text-muted-foreground mr-1" />
                    <span className="text-xs text-muted-foreground">Fast Shipping</span>
                  </div>
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 text-muted-foreground mr-1" />
                    <span className="text-xs text-muted-foreground">Privacy Protected</span>
                  </div>
                </div>
                <Button onClick={() => router("/shop")}>Continue Shopping</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      {step === "cancel" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Canceled Checkout</AlertTitle>
          <AlertDescription>
            Your checkout has been canceled. Please try again later.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
