import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { UpdateProductType } from "./utils";
// import { Product } from "./types"

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
interface JsonPreviewProps {
  data: ProductType[] | UpdateProductType[]
}

export function JsonPreview({ data }: JsonPreviewProps) {
  const [_view, setView] = useState<"formatted" | "raw">("formatted")

  // Count the number of products
  const productCount = Array.isArray(data) ? data.length : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">JSON Preview</h3>
        <span className="text-sm text-muted-foreground">
          {productCount} product{productCount !== 1 ? "s" : ""} found
        </span>
      </div>

      <Tabs defaultValue="formatted" onValueChange={(value) => setView(value as "formatted" | "raw")}>
        <TabsList className="grid w-60 grid-cols-2">
          <TabsTrigger value="formatted">Formatted</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
        </TabsList>
        <TabsContent value="formatted">
          <Card>
            <CardContent className="p-4">
              {Array.isArray(data) ? data.map((product: any, index: number) => (
                <div key={index} className="mb-6">
                  <h4 className="font-semibold mb-2">Product {index + 1}</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(product).map((key) => (
                          <TableHead key={key}>{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        {Object.values(product).map((value, valueIndex) => (
                          <TableCell key={valueIndex} className="break-words">
                            {typeof value === "object"
                              ? JSON.stringify(value, null, 2)
                              : String(value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )) : null}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="raw">
          <Card>
            <CardContent className="p-4">
              <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

