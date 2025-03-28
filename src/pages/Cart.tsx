import { useEffect, useState } from "react"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import {
  addOrUpdateCartRequest,
  formatName,
  formatSize,
  getCurrentTime,
  prodSpecs,
  syncProductSpecifications,
  toastNotification,
  tokenDetails
} from "@/components/utils"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Link } from "react-router-dom"
import { CartResponse } from "@/components/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

async function fetchCartData(
  page: number,
  size: number,
  userId: number,
  productName?: string,
  colorId?: number,
  sizeId?: number,
  sortBy?: string,
  sortDirection?: string,
) {
  // WARN: Backend URL
  const url = new URL("http://localhost:8080/customer/items")
  userId ? url.searchParams.append("userId", userId.toString()) : null
  productName ? url.searchParams.append("productName", productName) : null
  colorId ? url.searchParams.append("colorId", colorId.toString()) : null
  sizeId ? url.searchParams.append("sizeId", sizeId.toString()) : null
  sortBy ? url.searchParams.append("sortBy", sortBy) : null
  sortDirection ? url.searchParams.append("sortDirection", sortDirection) : null
  page ? url.searchParams.append("page", page.toString()) : null
  size ? url.searchParams.append("size", size.toString()) : null

  try {
    const token = localStorage.getItem("token")
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching cart data:", error)
    throw error
  }
}


// Function to remove cart item
async function removeCartItem(itemId: number) {
  try {
    const token = localStorage.getItem("token")
    if (itemId > 0) {
      const response = await fetch(`http://localhost:8080/customer/item?cartItemId=${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toastNotification("Removed cart item " + itemId, getCurrentTime())

      return true
    } else {
      return false
    }
  } catch (error) {
    console.error("Error removing cart item:", error)
    throw error
  }
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  // const [deleteCartItem, setDeleteCartItem] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const [prodSpecsData, setProdSpecsData] = useState(prodSpecs);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [subtotal, setSubtotal] = useState(0);

  // Fetch cart data on component mount
  useEffect(() => {
    setIsLoading(true)
    fetchCartData(0, 10, tokenDetails().id)
      .then((response) => {
        setCartItems(response)
        setError(null)
        setSubtotal(response.total)
      })
      .catch((err) => {
        setError("Failed to load cart items. Please try again.")
        console.error(err)
      })
      .finally(() => {
        setIsLoading(false)
      })

    syncProductSpecifications().then(res => {
      setProdSpecsData(res);
    })
  }, [])

  // Fetch on pagination page change
  useEffect(() => {
    setIsLoading(true)
    fetchCartData(page, 10, tokenDetails().id)
      .then((response) => {
        setCartItems(response)
        // setPage(response.page.number + 1)
        setTotalPages(response.page.totalPages)
        setError(null)
        setSubtotal(response.total)
      })
      .catch((err) => {
        setError("Failed to load cart items. Please try again.")
        console.error(err)
      })
      .finally(() => {
        setIsLoading(false)
      })

    // syncProductSpecifications().then(res => {
    //   setProdSpecsData(res);
    // })
  }, [page])

  // Update quantity function
  const updateQuantity = async (
    cartId: number,
    prodId: number,
    newQuantity: number,
    colorName: string,
    sizeName: string,
  ) => {
    const colorId = prodSpecsData.colors.find(color => color.color_name === colorName)?.color_id
    const sizeId = prodSpecsData.sizes.find(size => size.size_name === sizeName)?.size_id
    if (newQuantity < 1 || colorId === undefined || sizeId === undefined) return

    try {
      addOrUpdateCartRequest(tokenDetails().id, prodId, newQuantity, colorId, sizeId, "PUT")
        .then(_res => {
          // Update local state to reflect the change
          if (cartItems) {
            const updatedContent = cartItems.content.map((item) =>
              item.cart_items_id === cartId ? { ...item, quantity: newQuantity } : item,
            )

            setCartItems({
              ...cartItems,
              content: updatedContent,
            })
            toastNotification("Updated Cart Item", getCurrentTime())
          }
        })
    } catch (error) {
      console.error("Failed to update quantity:", error)
      setError("Failed to update quantity. Please try again.")
    }
  }

  // Handle delete confirmation
  const handleDeleteConfirmation = (id: number) => {
    setItemToDelete(id)
    setIsConfirmationOpen(true)
  }

  // Remove item function
  const confirmDelete = async () => {
    if (itemToDelete === null) return

    try {
      await removeCartItem(itemToDelete)

      // Update local state to reflect the removal
      if (cartItems) {
        const updatedContent = cartItems.content.filter((item) => item.cart_items_id !== itemToDelete)

        // Remove from all cart items too
        // const updatedAllItems = cartItems.filter((item) => item.cart_items_id !== itemToDelete)
        // setAllCartItems(updatedAllItems)

        // If the current page becomes empty after deletion and it's not the first page, go to previous page
        if (updatedContent.length === 0 && page > 0) {
          setPage(page - 1)
        } else {
          setCartItems({
            ...cartItems,
            content: updatedContent,
            page: {
              ...cartItems.page,
              totalElements: cartItems.page.totalElements - 1,
            },
          })
        }
      }

      // Reset the item to delete
      setItemToDelete(null)
    } catch (error) {
      console.error("Failed to remove item:", error)
      setError("Failed to remove item. Please try again.")
    }
  }

  const tax = subtotal * 0.08 // Assuming 8% tax
  const total = subtotal + tax

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Empty cart state
  if (!cartItems || cartItems.content.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="h-16 w-16 mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pb-16 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cart Item Headers - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-12 text-sm font-medium text-muted-foreground py-2">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {/* Cart Items */}
          {cartItems.content.map((item) => (
            <Card key={item.cart_items_id} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Product Info */}
                <div className="md:col-span-6 flex items-center space-x-4">
                  <div className="rounded-md overflow-hidden border">
                    <img
                      src={item.product.image || "/placeholder.svg?height=100&width=100"}
                      alt={item.product.productName}
                      className="w-36 object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium hover:underline">
                      <Link to={`/shop/view-product?productId=${item.product.productId}`}>{item.product.productName}</Link>
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="md:hidden">${item.product.price.toFixed(2)}</p>
                      <p>Size: {formatSize(item.size)}</p>
                      <p>Color: {formatName(item.color)}</p>
                      <p>Category: {formatName(item.product.category)}</p>
                    </div>
                  </div>
                </div>

                {/* Price - Hidden on mobile */}
                <div className="hidden md:block md:col-span-2 text-center">${item.product.price.toFixed(2)}</div>

                {/* Quantity Controls */}
                <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      onClick={() =>
                        updateQuantity(
                          item.cart_items_id,
                          item.product.productId,
                          item.quantity - 1,
                          item.color,
                          item.size,
                        )
                      }
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                      <span className="sr-only">Decrease quantity</span>
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      onClick={() =>
                        updateQuantity(
                          item.cart_items_id,
                          item.product.productId,
                          item.quantity + 1,
                          item.color,
                          item.size,
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Increase quantity</span>
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-destructive hover:text-destructive"
                    onClick={() => handleDeleteConfirmation(item.cart_items_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>

                {/* Item Total */}
                <div className="md:col-span-2 flex items-center justify-between">
                  <span className="md:hidden">Total:</span>
                  <span className="font-medium md:ml-auto">${(item.product.price * item.quantity).toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:inline-flex text-destructive hover:text-destructive"
                    onClick={() => handleDeleteConfirmation(item.cart_items_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
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
          <AlertDialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Are you sure you want to remove this product from the cart?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-1 -z-50">
          <Card className="p-6 sticky top-28">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full" size="lg">
              Proceed to Checkout
            </Button>

            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
