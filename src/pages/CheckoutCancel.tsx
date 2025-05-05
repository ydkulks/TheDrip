import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function CheckoutCancel() {
  localStorage.removeItem("checkout");
  return (
    <div className="container min-h-svh w-full mx-auto mb-5 px-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Canceled Checkout</AlertTitle>
        <AlertDescription>
          Your checkout has been canceled. Please try again later.
        </AlertDescription>
      </Alert>
    </div>
  )
}

