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
  tokenDetails,
} from "@/components/utils"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Link, useNavigate } from "react-router-dom"
import type { CartProducts, CartResponse } from "@/components/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Checkbox } from "@/components/ui/checkbox"

// Define a type for selected item details
interface SelectedItemDetails {
  productId: number
  quantity: number
  price: number
  cartItemId: number
}

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
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const [prodSpecsData, setProdSpecsData] = useState(prodSpecs)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [subtotal, setSubtotal] = useState(0)

  // Store selected items with their details in a Map
  const [selectedItems, setSelectedItems] = useState<Map<number, SelectedItemDetails>>(new Map())
  const [selectAllCurrentPage, setSelectAllCurrentPage] = useState(false)
  const [totalItemCount, setTotalItemCount] = useState(0)

  const navigate = useNavigate()

  // Fetch cart data
  const fetchCartDataPage = async (pageNum: number) => {
    setIsLoading(true)
    try {
      const userId = tokenDetails().id
      const cartData = await fetchCartData(pageNum, 10, userId)

      setCartItems(cartData)
      setPage(cartData.page.number)
      setTotalPages(cartData.page.totalPages)
      setSubtotal(cartData.total)
      setTotalItemCount(cartData.page.totalElements)

      // Check if all items on this page are selected
      if (cartData.content.length > 0) {
        const allSelected = cartData.content.every((item) => selectedItems.has(item.cart_items_id))
        setSelectAllCurrentPage(allSelected)
      } else {
        setSelectAllCurrentPage(false)
      }

      setError(null)
    } catch (err) {
      setError("Failed to load cart items. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch cart data on component mount
  useEffect(() => {
    fetchCartDataPage(page)

    syncProductSpecifications().then((res) => {
      setProdSpecsData(res)
    })
  }, [])

  // Fetch on pagination page change
  useEffect(() => {
    fetchCartDataPage(page)
  }, [page])

  // Calculate selected items subtotal
  const calculateSelectedSubtotal = () => {
    if (selectedItems.size === 0) return 0

    let total = 0
    selectedItems.forEach((item) => {
      total += item.price * item.quantity
    })

    return total
  }

  // Handle select all toggle for current page
  useEffect(() => {
    if (!cartItems || !cartItems.content) return

    if (selectAllCurrentPage) {
      // Select all items on current page
      const newSelectedItems = new Map(selectedItems)

      cartItems.content.forEach((item) => {
        newSelectedItems.set(item.cart_items_id, {
          productId: item.product.productId,
          quantity: item.quantity,
          price: item.product.price,
          cartItemId: item.cart_items_id,
        })
      })

      setSelectedItems(newSelectedItems)
    } else {
      // Deselect all items on current page
      const newSelectedItems = new Map(selectedItems)

      cartItems.content.forEach((item) => {
        newSelectedItems.delete(item.cart_items_id)
      })

      setSelectedItems(newSelectedItems)
    }
  }, [selectAllCurrentPage, cartItems])

  // Update quantity function
  const updateQuantity = async (
    cartId: number,
    prodId: number,
    newQuantity: number,
    colorName: string,
    sizeName: string,
    price: number,
  ) => {
    const colorId = prodSpecsData.colors.find((color) => color.color_name === colorName)?.color_id
    const sizeId = prodSpecsData.sizes.find((size) => size.size_name === sizeName)?.size_id
    if (newQuantity < 1 || colorId === undefined || sizeId === undefined) return

    try {
      addOrUpdateCartRequest(tokenDetails().id, prodId, newQuantity, colorId, sizeId, "PUT").then((_res) => {
        // Update local state to reflect the change
        if (cartItems) {
          const updatedContent = cartItems.content.map((item) =>
            item.cart_items_id === cartId ? { ...item, quantity: newQuantity } : item,
          )

          setCartItems({
            ...cartItems,
            content: updatedContent,
          })

          // Update selected items if this item is selected
          if (selectedItems.has(cartId)) {
            const newSelectedItems = new Map(selectedItems)
            newSelectedItems.set(cartId, {
              productId: prodId,
              quantity: newQuantity,
              price: price,
              cartItemId: cartId,
            })
            setSelectedItems(newSelectedItems)
          }

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

        // Remove from selected items
        const newSelectedItems = new Map(selectedItems)
        newSelectedItems.delete(itemToDelete)
        setSelectedItems(newSelectedItems)

        // Update total item count
        setTotalItemCount((prev) => prev - 1)

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

          // Check if all remaining items on this page are selected
          if (updatedContent.length > 0) {
            const allSelected = updatedContent.every((item) => newSelectedItems.has(item.cart_items_id))
            setSelectAllCurrentPage(allSelected)
          } else {
            setSelectAllCurrentPage(false)
          }
        }
      }

      // Reset the item to delete
      setItemToDelete(null)
    } catch (error) {
      console.error("Failed to remove item:", error)
      setError("Failed to remove item. Please try again.")
    }
  }

  // Toggle item selection
  const toggleItemSelection = (itemId: number, productId: number, quantity: number, price: number) => {
    const newSelectedItems = new Map(selectedItems)

    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId)
      setSelectAllCurrentPage(false)
    } else {
      newSelectedItems.set(itemId, {
        productId,
        quantity,
        price,
        cartItemId: itemId,
      })

      // Check if all items on current page are now selected
      if (cartItems) {
        const allSelected = cartItems.content.every(
          (item) => item.cart_items_id === itemId || newSelectedItems.has(item.cart_items_id),
        )
        setSelectAllCurrentPage(allSelected)
      }
    }

    setSelectedItems(newSelectedItems)
  }

  // Calculate totals based on selected items
  const selectedSubtotal = calculateSelectedSubtotal()
  const selectedTax = selectedSubtotal * 0.12
  const selectedTotal = selectedSubtotal + selectedTax

  // Handle checkout with selected items
  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      toastNotification("Please select items to checkout", getCurrentTime())
      return
    }

    const checkoutData: CartProducts[] = Array.from(selectedItems.values()).map((item) => ({
      productId: item.productId,
      qty: item.quantity,
    }))

    navigate("/checkout", { state: checkoutData })
  }

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
    <div className="container mx-auto px-4 pb-16">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Select All and Cart Item Headers */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectAllCurrentPage}
                onCheckedChange={() => setSelectAllCurrentPage(!selectAllCurrentPage)}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select All Items on This Page
              </label>
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedItems.size} of {totalItemCount} items selected
            </div>
          </div>

          {/* Cart Item Headers - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-12 text-sm font-medium text-muted-foreground py-2">
            <div className="col-span-1"></div>
            <div className="col-span-5">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {/* Cart Items */}
          {cartItems.content.map((item) => (
            <Card
              key={item.cart_items_id}
              className={`p-4 ${selectedItems.has(item.cart_items_id) ? "border-primary" : ""}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Checkbox */}
                <div className="md:col-span-1 flex items-center">
                  <Checkbox
                    id={`item-${item.cart_items_id}`}
                    checked={selectedItems.has(item.cart_items_id)}
                    onCheckedChange={() =>
                      toggleItemSelection(item.cart_items_id, item.product.productId, item.quantity, item.product.price)
                    }
                    className="ml-1"
                  />
                </div>

                {/* Product Info */}
                <div className="md:col-span-5 flex items-center space-x-4">
                  <div className="rounded-md overflow-hidden border">
                    <img
                      src={item.product.image || "/placeholder.svg?height=100&width=100"}
                      alt={item.product.productName}
                      className="w-36 object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium hover:underline">
                      <Link to={`/shop/view-product?productId=${item.product.productId}`}>
                        {item.product.productName}
                      </Link>
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
                          item.product.price,
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
                          item.product.price,
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

          {/* Pagination */}
          {totalPages > 0 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(Math.max(0, page - 1))
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i).map((index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href="#"
                      isActive={index === page}
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(index)
                      }}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(Math.min(totalPages - 1, page + 1))
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          {/* Delete Confirmation Dialog */}
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
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-28">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Selected Items</span>
                <span>
                  {selectedItems.size} of {totalItemCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${selectedSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (12%)</span>
                <span>${selectedTax.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${selectedTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleCheckout} disabled={selectedItems.size === 0}>
              Proceed to Checkout
            </Button>

            <div className="mt-4">
              <Link to="/shop">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
