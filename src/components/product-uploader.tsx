import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FileUploader } from "./file-uploader"
import { JsonPreview } from "./json-preview"
import { IdMappingGuide } from "./id-mapping-guide"
import { AlertCircle, CheckCircle2, Download, Upload } from "lucide-react"
import * as yup from "yup"
import { getCurrentTime, toastNotification, tokenDetails } from "./utils"

interface ProductType {
  productName: string;
  categoryId: number;
  userId?: number;
  seriesId: number;
  productPrice: number;
  productDescription: string;
  productStock: number;
  productSizes: number[];
  productColors: number[];
}
// Sample template data
const templateData: ProductType[] = [
  {
    "productName": "Product Name",
    "categoryId": 0,
    // "userId": 0, // Add userId from token
    "seriesId": 0,
    "productPrice": 0.00,
    "productDescription": "Product Description",
    "productStock": 0,
    "productSizes": [0],
    "productColors": [0]
  }
]

const productSchema = yup.object({
  productName: yup.string().required(),
  categoryId: yup.number().required(),
  // userId: Yup.number(), // Add userId from token
  seriesId: yup.number().required(),
  productPrice: yup.number().required(),
  productDescription: yup.string().required(),
  productStock: yup.number().required(),
  productSizes: yup.array().of(yup.number()).required(),
  productColors: yup.array().of(yup.number()).required(),
})

const productArraySchema = yup.array().of(productSchema)

async function uploadProducts(products: any) {
  const token = localStorage.getItem("token");
  let url = `http://localhost:8080/seller/products`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(products),
  });

  if (!response.ok) {
    // Handle HTTP errors (e.g., 404, 500)
    console.error(`HTTP error! status: ${response.status}`);
    toastNotification("HTTP error! status", getCurrentTime());
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  // Simulate upload delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 2000)
  })
}

export function ProductUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [jsonData, setJsonData] = useState<ProductType[] | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile)
    parseJSON(selectedFile)
  }

  const parseJSON = (file: File) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        const data: ProductType[] = JSON.parse(text)

        // Validate the JSON data using Yup
        await productArraySchema.validate(data)

        data ? data.map((product) => {
          product.userId = tokenDetails().id // Add userId from token
        }) : null;

        setJsonData(data)
        setErrorMessage("")
      } catch (error) {
        setJsonData(null)
        setErrorMessage("Invalid JSON format. Please check your file and try again.")
      }
    }
    reader.readAsText(file)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadStatus("idle")
    setErrorMessage("")

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 5
      })
    }, 100)

    try {
      await uploadProducts(jsonData)
      setUploadProgress(100)
      setUploadStatus("success")
    } catch (error) {
      setUploadStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to upload products")
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setJsonData(null)
    setUploadProgress(0)
    setUploadStatus("idle")
    setErrorMessage("")
  }

  const downloadTemplate = () => {
    const dataStr = JSON.stringify(templateData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = "product-template.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <CardTitle className="text-xl">JSON Product Upload</CardTitle>
            <CardDescription>
              Upload a JSON file with product details to create multiple products at once.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <IdMappingGuide />

        {!file && <FileUploader onFileSelected={handleFileSelected} />}

        {errorMessage && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {file && jsonData && uploadStatus === "idle" && (
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <Upload className="h-4 w-4" />
              <span>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </span>
              <Button variant="ghost" size="sm" onClick={resetUpload}>
                Change
              </Button>
            </div>

            <JsonPreview data={jsonData} />
          </div>
        )}

        {isUploading && (
          <div className="space-y-4 mt-4">
            <Progress value={uploadProgress} className="h-2 w-full" />
            <p className="text-sm text-center">Uploading products... {uploadProgress}%</p>
          </div>
        )}

        {uploadStatus === "success" && (
          <Alert className="bg-green-50 border-green-200 mt-4">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Upload Successful</AlertTitle>
            <AlertDescription className="text-green-700">
              Your products have been successfully uploaded and are being processed.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {uploadStatus === "success" ? (
          <Button onClick={resetUpload}>Upload Another File</Button>
        ) : (
          <>
            <Button variant="outline" onClick={resetUpload} disabled={!file || isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || !jsonData || isUploading}>
              {isUploading ? "Uploading..." : "Upload Products"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

