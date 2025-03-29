import { useState } from "react"
// import { useRouter } from "next/navigation"
import { CheckCircle2, CreditCard, Lock, MapPin, Package, ShieldCheck, Truck, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useNavigate } from "react-router-dom"
import { OrderStatusTracker } from "@/components/order-status-tracker"
import { OrderSummary } from "@/components/order-summary"

export default function CheckoutPage() {
  const router = useNavigate()
  const [step, setStep] = useState<"information" | "shipping" | "payment" | "review" | "confirmation">("information")
  const [orderPlaced, setOrderPlaced] = useState(false)

  const handlePlaceOrder = () => {
    setOrderPlaced(true)
    setStep("confirmation")
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

      {!orderPlaced ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "information" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  <User size={16} />
                </div>
                <span className={`hidden md:block ${step === "information" ? "font-medium" : "text-muted-foreground"}`}>Information</span>
              </div>
              <div className="h-px w-8 bg-border"></div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "shipping" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  <Truck size={16} />
                </div>
                <span className={`hidden md:block ${step === "shipping" ? "font-medium" : "text-muted-foreground"}`}>Shipping</span>
              </div>
              <div className="h-px w-8 bg-border"></div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "payment" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  <CreditCard size={16} />
                </div>
                <span className={`hidden md:block ${step === "payment" ? "font-medium" : "text-muted-foreground"}`}>Payment</span>
              </div>
              <div className="h-px w-8 bg-border"></div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "review" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  <CheckCircle2 size={16} />
                </div>
                <span className={`hidden md:block ${step === "review" ? "font-medium" : "text-muted-foreground"}`}>Review</span>
              </div>
            </div>

            <Card>
              {step === "information" && (
                <>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>Enter your contact and shipping details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john.doe@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" placeholder="123 Main St" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="New York" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" placeholder="NY" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input id="zip" placeholder="10001" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => router("/cart")}>
                      Return to Cart
                    </Button>
                    <Button onClick={() => setStep("shipping")}>Continue to Shipping</Button>
                  </CardFooter>
                </>
              )}

              {step === "shipping" && (
                <>
                  <CardHeader>
                    <CardTitle>Shipping Method</CardTitle>
                    <CardDescription>Select your preferred shipping method</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup defaultValue="standard">
                      <div className="flex items-center space-x-2 border rounded-md p-4">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard" className="flex-1 cursor-pointer">
                          <div className="font-medium">Standard Shipping</div>
                          <div className="text-sm text-muted-foreground">3-5 business days</div>
                        </Label>
                        <div className="font-medium">$5.99</div>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-4">
                        <RadioGroupItem value="express" id="express" />
                        <Label htmlFor="express" className="flex-1 cursor-pointer">
                          <div className="font-medium">Express Shipping</div>
                          <div className="text-sm text-muted-foreground">1-2 business days</div>
                        </Label>
                        <div className="font-medium">$12.99</div>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-4">
                        <RadioGroupItem value="overnight" id="overnight" />
                        <Label htmlFor="overnight" className="flex-1 cursor-pointer">
                          <div className="font-medium">Overnight Shipping</div>
                          <div className="text-sm text-muted-foreground">Next business day</div>
                        </Label>
                        <div className="font-medium">$19.99</div>
                      </div>
                    </RadioGroup>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Delivery Instructions (Optional)</Label>
                      <Textarea id="notes" placeholder="Special instructions for delivery" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep("information")}>
                      Back
                    </Button>
                    <Button onClick={() => setStep("payment")}>Continue to Payment</Button>
                  </CardFooter>
                </>
              )}

              {step === "payment" && (
                <>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Select your preferred payment method</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Tabs defaultValue="card">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="card">Credit Card</TabsTrigger>
                        <TabsTrigger value="paypal">PayPal</TabsTrigger>
                        <TabsTrigger value="apple">Apple Pay</TabsTrigger>
                      </TabsList>
                      <TabsContent value="card" className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardName">Name on Card</Label>
                          <Input id="cardName" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <div className="relative">
                            <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                              <img src="/placeholder.svg?height=24&width=36" alt="Visa" width={36} height={24} />
                              <img
                                src="/placeholder.svg?height=24&width=36"
                                alt="Mastercard"
                                width={36}
                                height={24}
                              />
                              <img src="/placeholder.svg?height=24&width=36" alt="Amex" width={36} height={24} />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input id="expiry" placeholder="MM/YY" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" placeholder="123" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Lock size={16} className="text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Your payment information is secure and encrypted
                          </span>
                        </div>
                      </TabsContent>
                      <TabsContent value="paypal" className="pt-4">
                        <div className="text-center py-8">
                          <img
                            src="/placeholder.svg?height=60&width=120"
                            alt="PayPal"
                            width={120}
                            height={60}
                            className="mx-auto mb-4"
                          />
                          <p className="text-muted-foreground">
                            You will be redirected to PayPal to complete your payment
                          </p>
                        </div>
                      </TabsContent>
                      <TabsContent value="apple" className="pt-4">
                        <div className="text-center py-8">
                          <img
                            src="/placeholder.svg?height=60&width=120"
                            alt="Apple Pay"
                            width={120}
                            height={60}
                            className="mx-auto mb-4"
                          />
                          <p className="text-muted-foreground">Complete your purchase with Apple Pay</p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="billingAddress">Billing Address</Label>
                        <RadioGroup defaultValue="same">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="same" id="same" />
                            <Label htmlFor="same">Same as shipping address</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="different" id="different" />
                            <Label htmlFor="different">Use a different billing address</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="promoCode">Promotional Code</Label>
                        <div className="flex space-x-2">
                          <Input id="promoCode" placeholder="Enter code" className="flex-1" />
                          <Button variant="outline">Apply</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep("shipping")}>
                      Back
                    </Button>
                    <Button onClick={() => setStep("review")}>Review Order</Button>
                  </CardFooter>
                </>
              )}

              {step === "review" && (
                <>
                  <CardHeader>
                    <CardTitle>Review Your Order</CardTitle>
                    <CardDescription>Please review your order details before placing your order</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-medium flex items-center mb-2">
                        <User size={16} className="mr-2" /> Contact Information
                      </h3>
                      <div className="text-sm bg-muted p-3 rounded-md">
                        <p>John Doe</p>
                        <p>john.doe@example.com</p>
                        <p>+1 (555) 000-0000</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium flex items-center mb-2">
                        <MapPin size={16} className="mr-2" /> Shipping Address
                      </h3>
                      <div className="text-sm bg-muted p-3 rounded-md">
                        <p>123 Main St</p>
                        <p>New York, NY 10001</p>
                        <p>United States</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium flex items-center mb-2">
                        <Truck size={16} className="mr-2" /> Shipping Method
                      </h3>
                      <div className="text-sm bg-muted p-3 rounded-md">
                        <p>Standard Shipping (3-5 business days)</p>
                        <p>$5.99</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium flex items-center mb-2">
                        <CreditCard size={16} className="mr-2" /> Payment Method
                      </h3>
                      <div className="text-sm bg-muted p-3 rounded-md">
                        <p>Credit Card ending in 3456</p>
                        <p>Billing address: Same as shipping</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-2">Order Items</h3>
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
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep("payment")}>
                      Back
                    </Button>
                    <Button onClick={handlePlaceOrder}>Place Order</Button>
                  </CardFooter>
                </>
              )}
            </Card>
          </div>

          <div className="lg:col-span-1">
          <OrderSummary />
          </div>
        </div>
      ) : (
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
                  A confirmation email has been sent to john.doe@example.com
                </p>
              </div>

              <OrderStatusTracker />

              <div className="border rounded-lg p-4">
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
              </div>

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
    </div>
  )
}
