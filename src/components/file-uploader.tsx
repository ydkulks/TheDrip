import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileJson } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploaderProps {
  onFileSelected: (file: File) => void
}

export function FileUploader({ onFileSelected }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        onFileSelected(file)
      } else {
        alert("Please upload a JSON file")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        onFileSelected(file)
      } else {
        alert("Please upload a JSON file")
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-10 text-center ${
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
      />
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-primary/10 p-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-lg font-medium">Drag and drop your JSON file here</p>
          <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
        </div>
        <Button onClick={handleButtonClick} variant="outline" className="mt-2">
          <FileJson className="mr-2 h-4 w-4" />
          Select JSON File
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Only one JSON file is accepted. Use the template button above to download a sample format.
      </p>
    </div>
  )
}

