import React, { useEffect } from "react"
import {
  UploadCloud,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Upload,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { jwtDecode } from "jwt-decode"
import * as yup from "yup"
import { toastNotification } from "@/components/utils"
import { useSearchParams } from "react-router-dom"
import BulkUploadPage from "@/components/bulk-image-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type FileStatus = "idle" | "uploading" | "success" | "error"

interface FileWithStatus {
  file: File
  id: string
  progress: number
  status: FileStatus
  error?: string
}

interface tokenType {
  email: string
  exp: number
  iat: number
  id: number
  role: string
  sub: string
}

const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB (adjust as needed)
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]

const validationSchema = yup.object().shape({
  productId: yup
    .number()
    .positive("Product ID must be a positive number")
    .required("Product ID is required"),
  files: yup
    .array()
    .of(
      yup.mixed()
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

export default function ProductImages() {
  const [isDragging, setIsDragging] = React.useState(false)
  const [files, setFiles] = React.useState<FileWithStatus[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  // const [productId, setProductId] = React.useState<number|null>(null)
  const token = localStorage.getItem("token")
  let decodedToken: tokenType | null = null
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [errors, setErrors] = React.useState<{
    productId?: string
    files?: string
  }>({})
  const [searchParams] = useSearchParams();
  const productIdParam = searchParams.get('productId');
  let productId: number | null = null;

  if (productIdParam) {
    const parsedProductId = parseInt(productIdParam, 10);

    if (!isNaN(parsedProductId)) {
      productId = parsedProductId;
      console.log(productId);
      // setProductId(parsedProductId);
    } else {
      console.error("Invalid productId in URL:", productIdParam);
      // Handle the error (e.g., redirect, display a message)
    }
  }

  if (token) {
    decodedToken = jwtDecode<tokenType>(token)
  }

  const username = decodedToken?.sub || "" // Use sub as username

  const handleDragEnter = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
    },
    [],
  )

  const handleDragLeave = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    },
    [],
  )

  const handleDragOver = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
    },
    [],
  )

  const startFileUpload = React.useCallback(
    (fileWithStatus: FileWithStatus) => {
      const { id, file } = fileWithStatus

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === id ? { ...f, status: "uploading", progress: 0 } : f,
        ),
      )

      const formData = new FormData()
      formData.append("file", file) // Append each file to the FormData

      fetch(
        `http://localhost:8080/seller/${username}/${productId}/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
          }
          return response.text() // Or response.text() if your backend doesn't return JSON
        })
        .then((_data) => {
          // Handle success (e.g., update UI with image URLs from the response)
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === id ? { ...f, status: "success", progress: 100 } : f,
            ),
          )
        })
        .catch((error) => {
          console.error("Upload failed:", error)
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === id
                ? {
                  ...f,
                  status: "error",
                  progress: 0,
                  error: `Upload failed: ${error.message}`,
                }
                : f,
            ),
          )
        })
    },
    [username, productId, token],
  )
  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files)
        setSelectedFiles(droppedFiles)
      }
    },
    [],
  )

  const handleFileInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFiles = Array.from(e.target.files)
        setSelectedFiles(selectedFiles)
      }
    },
    [],
  )

  const handleButtonClick = React.useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleSendClick = React.useCallback(() => {
    validationSchema
      .validate({ productId: Number(productId), files: selectedFiles }, { abortEarly: false })
      .then(() => {
        setErrors({}) // Clear previous errors

        const newFilesWithStatus: FileWithStatus[] = selectedFiles.map(
          (file) => ({
            file,
            id: crypto.randomUUID(),
            progress: 0,
            status: "idle",
          }),
        )

        setFiles((prevFiles) => [...prevFiles, ...newFilesWithStatus])

        // Start file uploads
        newFilesWithStatus.forEach((fileWithStatus) => {
          startFileUpload(fileWithStatus)
        })
      })
      .catch((err: yup.ValidationError) => {
        const newErrors: { productId?: string; files?: string } = {}
        err.inner.forEach((error) => {
          if (error.path === "productId") {
            newErrors.productId = error.message
          } else if (error.path === "files") {
            newErrors.files = error.message
          }
        })
        setErrors(newErrors)
      })
  }, [productId, selectedFiles, startFileUpload])

  const removeFile = React.useCallback((fileId: string) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId))
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    )
  }

  useEffect(() => {
    if (errors.files) toastNotification("Invalid Image Files", errors.files);
  }, [errors]);

  return (
    <Tabs defaultValue="uploadImage" className="w-full">
      <TabsList>
        <TabsTrigger value="uploadImage">Upload Images</TabsTrigger>
        <TabsTrigger value="bulkUploadImages">Bulk Upload Images</TabsTrigger>
      </TabsList>
      <TabsContent value="uploadImage">
        <div className="w-full max-w-2xl mx-auto p-4">
          <Card
            className={`border-2 border-dashed p-6 ${isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25"
              }`}
          >
            <CardContent
              className="flex flex-col items-center justify-center gap-4 p-0"
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
                multiple
              />

              <div className="flex flex-col items-center justify-center text-center">
                <UploadCloud
                  className={`h-12 w-12 mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"
                    }`}
                />
                <h3 className="text-lg font-semibold">
                  {isDragging ? "Drop files here" : "Drag & drop files here"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse files from your computer
                </p>
              </div>

              <Button variant="outline" onClick={handleButtonClick} className="mt-2">
                Select Files
              </Button>
            </CardContent>
          </Card>
          <Button onClick={handleSendClick} disabled={productId && selectedFiles.length > 0 ? false : true} className="mt-3 mr-2">
            <Upload />Upload Images
          </Button>

          {files.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Uploaded Files</h3>
              <div className="space-y-3">
                {files.map((fileItem) => (
                  <div
                    key={fileItem.id}
                    className="flex items-center p-3 border rounded-lg bg-card"
                  >
                    <div className="mr-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="truncate pr-4">
                          <p className="text-sm font-medium truncate">
                            {fileItem.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(fileItem.file.size)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile(fileItem.id)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {fileItem.status === "uploading" && (
                        <div className="mt-2">
                          <Progress value={fileItem.progress} className="h-1" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Uploading: {fileItem.progress}%
                          </p>
                        </div>
                      )}

                      {fileItem.status === "success" && (
                        <div className="flex items-center mt-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>Upload complete</span>
                        </div>
                      )}

                      {fileItem.status === "error" && (
                        <div className="flex items-center mt-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          <span>{fileItem.error}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </TabsContent>
      <TabsContent value="bulkUploadImages">
        <BulkUploadPage />
      </TabsContent>
    </Tabs>
  )
}

