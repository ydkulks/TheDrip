import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export function OrderSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-md overflow-hidden mr-4">
              <img
                src="/placeholder.svg?height=64&width=64"
                alt="Product"
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">Premium Cotton T-Shirt</p>
              <p className="text-sm text-muted-foreground">Size: M | Color: Blue</p>
            </div>
            <div className="text-right">
              <p className="font-medium">$29.99</p>
              <p className="text-sm text-muted-foreground">Qty: 2</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-md overflow-hidden mr-4">
              <img
                src="/placeholder.svg?height=64&width=64"
                alt="Product"
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">Slim Fit Jeans</p>
              <p className="text-sm text-muted-foreground">Size: 32 | Color: Dark Blue</p>
            </div>
            <div className="text-right">
              <p className="font-medium">$49.99</p>
              <p className="text-sm text-muted-foreground">Qty: 1</p>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>$109.97</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>$5.99</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>$9.24</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span>-$0.00</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-medium">
          <span>Total</span>
          <span>$125.20</span>
        </div>

        <div className="pt-4">
          <div className="flex space-x-2">
            <Input placeholder="Promo code" className="flex-1" />
            <Button variant="outline">Apply</Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <div className="flex flex-wrap justify-center gap-2">
          <img src="/placeholder.svg?height=24&width=36" alt="Visa" width={36} height={24} />
          <img src="/placeholder.svg?height=24&width=36" alt="Mastercard" width={36} height={24} />
          <img src="/placeholder.svg?height=24&width=36" alt="Amex" width={36} height={24} />
          <img src="/placeholder.svg?height=24&width=36" alt="PayPal" width={36} height={24} />
          <img src="/placeholder.svg?height=24&width=36" alt="Apple Pay" width={36} height={24} />
        </div>
      </CardFooter>
    </Card>
  )
}
