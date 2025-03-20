import { useState, useEffect } from "react"
import { Upload, X, Check, AlertCircle, Eye, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getProductsById, tokenDetails } from "./utils"
import { ApiResponse } from "./types"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination"

interface ExistingImage {
  id: string
  url: string
  filename: string
}

interface Product {
  id: string
  name: string
  existingImages: ExistingImage[]
  newImages: File[]
  imagesToDelete: string[] // IDs of existing images to delete
}

interface UploadStatus {
  productId: string
  status: "idle" | "uploading" | "success" | "error"
  progress: number
  message?: string
}

interface BulkUploadProps {
  productIds: number[];
}

export default function BulkUploadPage({ productIds }: BulkUploadProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [uploadStatus, setUploadStatus] = useState<UploadStatus[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [username, setUsername] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Get username from token
    try {
      const details = tokenDetails()
      if (details && details.sub) {
        setUsername(details.sub)
      }
    } catch (error) {
      console.error("Error getting token details:", error)
    }

    const fetchSellerProducts = async (): Promise<Product[]> => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.")
        }

        const response: ApiResponse | null = await getProductsById(productIds, page)

        if (!response || !response.content) {
          throw new Error("No product data received from API")
        }

        setTotalPages(response.page.totalPages);

        // Convert API product data to the format used in this component
        const formattedProducts: Product[] = response.content.map((apiProduct) => ({
          id: `prod-${apiProduct.productId}`,
          name: apiProduct.productName,
          existingImages: apiProduct.images.map((url, index) => ({
            id: `img-<span class="math-inline">\{apiProduct\.productId\}\-</span>{index}`,
            url: url,
            filename: `product${apiProduct.productId}_image${index + 1}.jpg`,
          })),
          newImages: [],
          imagesToDelete: [],
        }))

        return formattedProducts
      } catch (error) {
        console.error("Error fetching seller products:", error)
        throw error
      }
    }
    fetchSellerProducts()
      .then((data) => {
        setProducts(data)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching products:", error)
        setIsLoading(false)
      })
  }, [page])

  const handleProductSelect = (product: Product) => {
    if (selectedProducts.some((p) => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id))
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          ...product,
          newImages: [],
          imagesToDelete: [],
        },
      ])
    }
  }

  const handleImageSelect = (productId: string, files: FileList) => {
    setSelectedProducts(
      selectedProducts.map((product) => {
        if (product.id === productId) {
          // Get total current images (existing that aren't marked for deletion + new)
          const currentImageCount =
            product.existingImages.filter((img) => !product.imagesToDelete.includes(img.id)).length +
            product.newImages.length

          // Calculate how many more images we can add
          const remainingSlots = 5 - currentImageCount

          if (remainingSlots <= 0) return product

          // Convert FileList to array and add to new images (up to remaining slots)
          const newImages = [...product.newImages]
          for (let i = 0; i < files.length && newImages.length < product.newImages.length + remainingSlots; i++) {
            newImages.push(files[i])
          }

          return { ...product, newImages }
        }
        return product
      }),
    )
  }

  const removeNewImage = (productId: string, index: number) => {
    setSelectedProducts(
      selectedProducts.map((product) => {
        if (product.id === productId) {
          const newImages = [...product.newImages]
          newImages.splice(index, 1)
          return { ...product, newImages }
        }
        return product
      }),
    )
  }

  const toggleExistingImageDelete = (productId: string, imageId: string) => {
    setSelectedProducts(
      selectedProducts.map((product) => {
        if (product.id === productId) {
          const imagesToDelete = [...product.imagesToDelete]

          if (imagesToDelete.includes(imageId)) {
            // Unmark for deletion
            return {
              ...product,
              imagesToDelete: imagesToDelete.filter((id) => id !== imageId),
            }
          } else {
            // Mark for deletion
            return {
              ...product,
              imagesToDelete: [...imagesToDelete, imageId],
            }
          }
        }
        return product
      }),
    )
  }

  const openImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
    setPreviewOpen(true)
  }

  const closeImagePreview = () => {
    setPreviewOpen(false)
    setPreviewImage(null)
  }

  const getTotalImagesCount = (product: Product) => {
    // Count existing images not marked for deletion + new images
    return (
      product.existingImages.filter((img) => !product.imagesToDelete.includes(img.id)).length + product.newImages.length
    )
  }

  const getRemainingSlots = (product: Product) => {
    return 5 - getTotalImagesCount(product)
  }

  const hasChanges = (product: Product) => {
    return product.newImages.length > 0 || product.imagesToDelete.length > 0
  }
  const uploadImages = async () => {
    if (!username) {
      alert("Username not found. Please log in again.")
      return
    }

    // Get token from localStorage
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Authentication token not found. Please log in again.")
      return
    }

    setIsUploading(true)

    // Initialize upload status for each product with changes
    const productsWithChanges = selectedProducts.filter(hasChanges)
    const initialStatus: UploadStatus[] = productsWithChanges.map((product) => ({
      productId: product.id,
      status: "idle",
      progress: 0,
    }))
    setUploadStatus(initialStatus)

    // Upload images for each product with changes
    for (const product of productsWithChanges) {
      // Update status to uploading
      setUploadStatus((prev) =>
        prev.map((status) =>
          status.productId === product.id ? { ...status, status: "uploading", progress: 10 } : status
        )
      )

      try {
        const formData = new FormData()
        let fileIndex = 1;

        // Add each new image to form data with the product ID as the key
        for (const image of product.newImages) {
          formData.append(`file${fileIndex}`, image);
          formData.append(`productId${fileIndex}`, product.id.replace('prod-', ''));
          fileIndex++;
        }

        // Add list of images to delete (if any)
        if (product.imagesToDelete.length > 0) {
          // In a real implementation, you might need to adjust how you send this information
          // depending on your API requirements
          formData.append("imagesToDelete", JSON.stringify(product.imagesToDelete))
        }

        // Update progress
        setUploadStatus((prev) =>
          prev.map((status) => (status.productId === product.id ? { ...status, progress: 50 } : status))
        )

        // Make the API request
        const response = await fetch(`http://localhost:8080/seller/${username}/product/images`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        // Update status to success
        setUploadStatus((prev) =>
          prev.map((status) =>
            status.productId === product.id
              ? { ...status, status: "success", progress: 100, message: "Upload complete" }
              : status
          )
        )
      } catch (error) {
        console.error(`Error uploading images for product ${product.id}:`, error)

        // Update status to error
        setUploadStatus((prev) =>
          prev.map((status) =>
            status.productId === product.id
              ? {
                ...status,
                status: "error",
                progress: 100,
                message: error instanceof Error ? error.message : "Upload failed",
              }
              : status
          )
        )
      }
    }

    setIsUploading(false)
  }

  const isReadyToUpload = selectedProducts.some(hasChanges)

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-xl font-bold">Bulk Image Upload</h1>
          <p className="text-muted-foreground mt-2">
            View, update, and upload images to your products. Maximum 5 images per product.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>Select products to manage images</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[380px] pr-4">
                  <div className="space-y-2">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors flex justify-between items-center ${selectedProducts.some((p) => p.id === product.id)
                          ? "bg-primary/10 border border-primary"
                          : "border hover:bg-muted"
                          }`}
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm">{product.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {product.existingImages.length} existing image
                            {product.existingImages.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {selectedProducts.some((p) => p.id === product.id) && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex-wrap">
                <div className="text-sm text-muted-foreground">{selectedProducts.length} products selected</div>
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

              </CardFooter>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Manage Product Images</CardTitle>
                <CardDescription>View existing images and add new ones (maximum 5 per product)</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[400px] border border-dashed rounded-md p-8 text-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No products selected</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Select products from the left panel to manage their images
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6">
                      {selectedProducts.map((product) => {
                        const status = uploadStatus.find((s) => s.productId === product.id)
                        const totalImages = getTotalImagesCount(product)
                        const remainingSlots = getRemainingSlots(product)

                        return (
                          <div key={product.id} className="border rounded-md p-4">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="font-medium">{product.name}</h3>
                              <Badge variant={totalImages > 0 ? "default" : "outline"}>{totalImages}/5 images</Badge>
                            </div>

                            {status?.status === "error" && (
                              <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{status.message || "Failed to upload images"}</AlertDescription>
                              </Alert>
                            )}

                            {status?.status === "success" && (
                              <Alert className="mb-4 bg-primary/10 border-primary">
                                <Check className="h-4 w-4" />
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>Images updated successfully</AlertDescription>
                              </Alert>
                            )}

                            {status?.status === "uploading" && (
                              <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Uploading...</span>
                                  <span>{status.progress}%</span>
                                </div>
                                <Progress value={status.progress} className="h-2" />
                              </div>
                            )}

                            {/* Existing Images Section */}
                            {product.existingImages.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium mb-2">Existing Images</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                  {product.existingImages.map((image) => {
                                    const isMarkedForDeletion = product.imagesToDelete.includes(image.id)

                                    return (
                                      <div key={image.id} className="relative group">
                                        <div
                                          className={`aspect-square rounded-md border overflow-hidden ${isMarkedForDeletion ? "opacity-40" : ""
                                            }`}
                                        >
                                          <img
                                            src={image.url || "/placeholder.svg"}
                                            alt={image.filename}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="absolute top-1 right-1 flex gap-1">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              openImagePreview(image.url)
                                            }}
                                            className="bg-background/80 text-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            disabled={isUploading}
                                          >
                                            <Eye className="h-3 w-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              toggleExistingImageDelete(product.id, image.id)
                                            }}
                                            className={`${isMarkedForDeletion
                                              ? "bg-primary text-primary-foreground opacity-100"
                                              : "bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100"
                                              } rounded-full p-1 transition-opacity`}
                                            disabled={isUploading}
                                          >
                                            {isMarkedForDeletion ? (
                                              <Check className="h-3 w-3" />
                                            ) : (
                                              <Trash2 className="h-3 w-3" />
                                            )}
                                          </button>
                                        </div>
                                        {isMarkedForDeletion && (
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-medium bg-background/80 text-foreground px-2 py-1 rounded">
                                              Marked for deletion
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* New Images Section */}
                            {product.newImages.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium mb-2">New Images</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                  {product.newImages.map((image, index) => (
                                    <div key={index} className="relative group">
                                      <div className="aspect-square rounded-md border overflow-hidden bg-muted">
                                        <img
                                          src={URL.createObjectURL(image) || "/placeholder.svg"}
                                          alt={`New image ${index + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeNewImage(product.id, index)}
                                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        disabled={isUploading}
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Add New Images */}
                            {remainingSlots > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">
                                  Add New Images ({remainingSlots} slot{remainingSlots !== 1 ? "s" : ""} remaining)
                                </h4>
                                <div className="flex items-center gap-3">
                                  <label className="aspect-square w-20 h-20 rounded-md border border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                                    <span className="text-xs text-muted-foreground">Add</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="hidden"
                                      onChange={(e) => e.target.files && handleImageSelect(product.id, e.target.files)}
                                      disabled={isUploading || remainingSlots <= 0}
                                    />
                                  </label>

                                  <div className="flex-1">
                                    <label className="cursor-pointer">
                                      <Button variant="outline" size="sm" disabled={remainingSlots <= 0 || isUploading}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Select Images
                                      </Button>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) =>
                                          e.target.files && handleImageSelect(product.id, e.target.files)
                                        }
                                        disabled={remainingSlots <= 0 || isUploading}
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )}

                            <Separator className="my-4" />

                            <div className="flex justify-between items-center">
                              <div className="text-sm text-muted-foreground">
                                {hasChanges(product) ? (
                                  <span className="text-primary font-medium">Changes pending</span>
                                ) : (
                                  <span>No changes</span>
                                )}
                              </div>

                              {product.imagesToDelete.length > 0 && (
                                <Badge variant="outline" className="mr-2">
                                  {product.imagesToDelete.length} marked for deletion
                                </Badge>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedProducts.reduce((total, product) => total + product.newImages.length, 0)} new images to
                  upload
                  {selectedProducts.reduce((total, product) => total + product.imagesToDelete.length, 0) > 0 && (
                    <span>
                      {" "}
                      • {selectedProducts.reduce((total, product) => total + product.imagesToDelete.length, 0)} to
                      delete
                    </span>
                  )}
                </div>
                <Button onClick={uploadImages} disabled={!isReadyToUpload || isUploading}>
                  {isUploading ? "Updating..." : "Update Images"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
            <DialogDescription>View full-size image</DialogDescription>
          </DialogHeader>
          {previewImage && (
            <div className="flex items-center justify-center p-2">
              <img
                src={previewImage || "/placeholder.svg"}
                alt="Preview"
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
