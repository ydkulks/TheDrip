import { useState, useEffect } from "react"
import { Upload, X, Check, AlertCircle, Eye, Trash2, Image } from "lucide-react"
import * as yup from "yup"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getProductsById, toastNotification, tokenDetails } from "./utils"
import type { ApiResponse } from "./types"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination"

// Validation constants
const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

// Validation schema
const validationSchema = yup.object().shape({
  productId: yup
    .array()
    .of(yup.number().positive("Product ID must be a positive number"))
    .min(1, "At least one Product ID is required"),
  files: yup
    .array()
    .of(
      yup
        .mixed()
        .test("fileSize", "File size is too large", (value: any) => {
          if (value) {
            return value.size <= MAX_FILE_SIZE
          }
          return true // Allow empty array
        })
        .test("fileType", "Unsupported File Format", (value: any) => {
          if (value) {
            return ACCEPTED_IMAGE_TYPES.includes(value.type)
          }
          return true // Allow empty array
        }),
    )
    .required("Please select at least one file"),
})

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
  productIds: number[]
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
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] }>({})

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

        setTotalPages(response.page.totalPages)

        // Convert API product data to the format used in this component
        const formattedProducts: Product[] = response.content.map((apiProduct) => ({
          id: `prod-${apiProduct.productId}`,
          name: apiProduct.productName,
          existingImages: apiProduct.images.map((url, index) => {
            // Extract the actual filename from the URL
            const urlParts = url.split("/")
            const filename = urlParts[urlParts.length - 1]

            return {
              id: `img-${apiProduct.productId}-${index}`,
              url: url,
              // Use the actual filename from the URL if available, otherwise fallback to the default
              filename: filename || `product${apiProduct.productId}_image${index + 1}.jpg`,
            }
          }),
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
  }, [page, productIds])

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

  const validateFiles = (productId: string, files: FileList): File[] => {
    const validFiles: File[] = []
    const errors: string[] = []

    // Convert FileList to array for validation
    const fileArray = Array.from(files)

    // Validate each file
    for (const file of fileArray) {
      try {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name}: File size exceeds 1MB limit`)
          continue
        }

        // Check file type
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          errors.push(`${file.name}: Unsupported file format (only JPEG, PNG, and WebP are allowed)`)
          continue
        }

        // File passed validation
        validFiles.push(file)
      } catch (error) {
        errors.push(`${file.name}: Unknown error occurred`)
      }
    }

    // Update validation errors state
    if (errors.length > 0) {
      setValidationErrors((prev) => ({
        ...prev,
        [productId]: errors,
      }))

      // Show toast with first error
      toastNotification("Validation Error", errors[0])
    } else {
      // Clear errors for this product if there were any
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[productId]
        return newErrors
      })
    }

    return validFiles
  }

  const handleImageSelect = (productId: string, files: FileList) => {
    // Validate files first
    const validFiles = validateFiles(productId, files)

    if (validFiles.length === 0) return // No valid files to add

    setSelectedProducts(
      selectedProducts.map((product) => {
        if (product.id === productId) {
          // Get total current images (existing that aren't marked for deletion + new)
          const currentImageCount =
            product.existingImages.filter((img) => !product.imagesToDelete.includes(img.id)).length +
            product.newImages.length

          // Calculate how many more images we can add
          const remainingSlots = 5 - currentImageCount

          if (remainingSlots <= 0) {
            toastNotification("Maximum images reached", "You can only have 5 images per product")
            return product
          }

          // Add valid files up to remaining slots
          const newImages = [...product.newImages]
          for (let i = 0; i < validFiles.length && newImages.length < product.newImages.length + remainingSlots; i++) {
            newImages.push(validFiles[i])
          }

          return { ...product, newImages }
        }
        return product
      }),
    )
  }

  // TODO: UI
  // Change the view and delete button to be compatible with phone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageSelect(productId, e.dataTransfer.files)
    }
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

  const validateBeforeUpload = (): boolean => {
    try {
      // Validate product IDs
      const productIdsToValidate = selectedProducts
        .filter(hasChanges)
        .map((product) => Number.parseInt(product.id.replace("prod-", "")))

      validationSchema.validateSync(
        {
          productId: productIdsToValidate,
          files: selectedProducts.flatMap((product) => product.newImages),
        },
        { abortEarly: false },
      )

      return true
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        // Show validation error
        toastNotification("Validation Error", error.errors[0])
      }
      return false
    }
  }

  const uploadImages = async () => {
    // Validate before upload
    if (!validateBeforeUpload()) {
      return
    }

    if (!username) {
      toastNotification("Authentication Error", "Username not found. Please log in again.")
      return
    }

    // Get token from localStorage
    const token = localStorage.getItem("token")
    if (!token) {
      toastNotification("Authentication Error", "Authentication token not found. Please log in again.")
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

    // NOTE: Delete images

    // Upload images for each product with changes
    for (const product of productsWithChanges) {
      // Update status to uploading
      setUploadStatus((prev) =>
        prev.map((status) =>
          status.productId === product.id ? { ...status, status: "uploading", progress: 10 } : status,
        ),
      )

      try {
        let deletionSuccess = true

        // Handle image deletions first
        if (product.imagesToDelete.length > 0) {
          // Update progress
          setUploadStatus((prev) =>
            prev.map((status) => (status.productId === product.id ? { ...status, progress: 20 } : status)),
          )

          const productIdRaw = Number.parseInt(product.id.replace("prod-", ""), 10)

          // Extract actual filenames for deletion (not IDs)
          const filenames = product.imagesToDelete
            .map((imageId) => {
              const imageToDelete = product.existingImages.find((img) => img.id === imageId)
              return imageToDelete ? imageToDelete.filename : null
            })
            .filter((filename): filename is string => filename !== null)
            .map((filename) => filename.split("?")[0]);

          if (filenames.length > 0) {
            const requestBody = {
              productIds: [productIdRaw],
              images: filenames,
            }

            console.log("Deletion request body:", requestBody)

            try {
              // Make the DELETE request
              // WARN: Backend URL
              const deleteResponse = await fetch(`http://localhost:8080/seller/${username}/productIds/images`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
              })

              if (!deleteResponse.ok) {
                deletionSuccess = false
                throw new Error(`Failed to delete images: ${deleteResponse.status}`)
              }

              // Update progress after successful deletion
              setUploadStatus((prev) =>
                prev.map((status) => (status.productId === product.id ? { ...status, progress: 40 } : status)),
              )
            } catch (error) {
              deletionSuccess = false
              console.error("Error deleting images:", error)
              throw error // Re-throw to be caught by the outer try/catch
            }
          }
        }

        // Handle new image uploads
        let uploadSuccess = true
        if (product.newImages.length > 0) {
          const formData = new FormData()
          let fileIndex = 1

          // Add each new image to form data with the product ID as the key
          for (const image of product.newImages) {
            formData.append(`file${fileIndex}`, image)
            formData.append(`productId${fileIndex}`, product.id.replace("prod-", ""))
            fileIndex++
          }

          // Update progress
          setUploadStatus((prev) =>
            prev.map((status) => (status.productId === product.id ? { ...status, progress: 60 } : status)),
          )

          try {
            // Make the API request
            // WARN: Backend URL
            const response = await fetch(`http://localhost:8080/seller/${username}/product/images`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            })

            if (!response.ok) {
              uploadSuccess = false
              throw new Error(`Error uploading images: ${response.status}`)
            }

            // Update progress after successful upload
            setUploadStatus((prev) =>
              prev.map((status) => (status.productId === product.id ? { ...status, progress: 80 } : status)),
            )
          } catch (error) {
            uploadSuccess = false
            console.error("Error uploading images:", error)
            throw error // Re-throw to be caught by the outer try/catch
          }
        }

        // Update status to success
        setUploadStatus((prev) =>
          prev.map((status) =>
            status.productId === product.id
              ? { ...status, status: "success", progress: 100, message: "Upload complete" }
              : status,
          ),
        )

        // Only update the UI if both deletion and upload were successful
        if (deletionSuccess && uploadSuccess) {
          // Clear the changes for this product after successful upload/deletion
          setSelectedProducts((prev) =>
            prev.map((p) =>
              p.id === product.id
                ? {
                    ...p,
                    newImages: [],
                    imagesToDelete: [],
                    // Remove deleted images from existingImages
                    existingImages: p.existingImages.filter((img) => !p.imagesToDelete.includes(img.id)),
                  }
                : p,
            ),
          )
        }
      } catch (error) {
        console.error(`Error processing images for product ${product.id}:`, error)

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
              : status,
          ),
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
                <ScrollArea className="h-[380px]">
                  <div className="space-y-2">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors flex justify-between items-center ${
                          selectedProducts.some((p) => p.id === product.id)
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
                      <PaginationPrevious href="#" onClick={() => setPage(Math.max(0, page - 1))} />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i).map((index) => (
                      <PaginationItem key={index}>
                        <PaginationLink href="#" isActive={index === page} onClick={() => setPage(index)}>
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext href="#" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} />
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
                    <Image className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No products selected</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Select products from the left panel to manage their images
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-6">
                      {selectedProducts.map((product) => {
                        const status = uploadStatus.find((s) => s.productId === product.id)
                        const totalImages = getTotalImagesCount(product)
                        const remainingSlots = getRemainingSlots(product)
                        const productErrors = validationErrors[product.id] || []

                        return (
                          <div key={product.id} className="border rounded-md p-4">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="font-medium">{product.name}</h3>
                              <Badge variant={totalImages > 0 ? "default" : "outline"}>{totalImages}/5 images</Badge>
                            </div>

                            {productErrors.length > 0 && (
                              <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Validation Errors</AlertTitle>
                                <AlertDescription>
                                  <ul className="list-disc pl-4 text-sm">
                                    {productErrors.map((error, index) => (
                                      <li key={index}>{error}</li>
                                    ))}
                                  </ul>
                                </AlertDescription>
                              </Alert>
                            )}

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
                                      <div key={image.id + image.filename} className="relative group">
                                        <div
                                          className={`aspect-square rounded-md border overflow-hidden ${
                                            isMarkedForDeletion ? "opacity-40" : ""
                                          }`}
                                        >
                                          <img
                                            id={image.filename + image.id}
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
                                            className={`${
                                              isMarkedForDeletion
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
                                        <div className="absolute bottom-1 left-1 right-1">
                                          <div className="text-xs bg-background/80 text-foreground px-2 py-1 rounded truncate">
                                            {image.filename.split("?")[0]}
                                          </div>
                                        </div>
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
                                    <div key={index} className="relative z-0 group">
                                      <div className="aspect-square rounded-md border overflow-hidden bg-muted">
                                        <img
                                          id={product.name + product.id}
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
                                      <div className="absolute bottom-1 left-1 right-1">
                                        <div className="text-xs bg-background/80 text-foreground px-2 py-1 rounded truncate">
                                          {image.name} ({(image.size / 1024).toFixed(1)} KB)
                                        </div>
                                      </div>
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
                                <div
                                  className="border-2 border-dashed rounded-md p-4 mb-3 transition-colors hover:bg-muted/50"
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, product.id)}
                                >
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-center">
                                      Drag & drop images here, or{" "}
                                      <label className="text-primary cursor-pointer hover:underline">
                                        browse
                                        <input
                                          type="file"
                                          accept="image/jpeg,image/jpg,image/png,image/webp"
                                          multiple
                                          className="hidden"
                                          onChange={(e) =>
                                            e.target.files && handleImageSelect(product.id, e.target.files)
                                          }
                                          disabled={isUploading || remainingSlots <= 0}
                                        />
                                      </label>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Max 1MB per image. Supported formats: JPG, PNG, WebP
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={remainingSlots <= 0 || isUploading}
                                    onClick={() => {
                                      // Find the file input and trigger a click
                                      const fileInput = document.getElementById(
                                        `file-input-${product.id}`,
                                      ) as HTMLInputElement
                                      if (fileInput) fileInput.click()
                                    }}
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Select Images
                                  </Button>
                                  <input
                                    id={`file-input-${product.id}`}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => e.target.files && handleImageSelect(product.id, e.target.files)}
                                    disabled={remainingSlots <= 0 || isUploading}
                                  />
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
