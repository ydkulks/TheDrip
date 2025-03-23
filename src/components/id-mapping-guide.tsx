import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InfoIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { formatName, prodSpecs, ProdSpecsType, syncProductSpecifications } from "./utils"

export function IdMappingGuide() {
  const [prodSpecsData, setProdSpecsData] = useState(prodSpecs);
  useEffect(() => {
    syncProductSpecifications()
      .then((response) => {
        setProdSpecsData(response as ProdSpecsType);
      });
  }, [])
  return (
    <Card className="mb-6 border-blue-100 max-h-3xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <InfoIcon className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-lg text-blue-700">ID Reference Guide</CardTitle>
        </div>
        <CardDescription>Use these ID references when creating your JSON file</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="categories">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="series">Series</TabsTrigger>
            <TabsTrigger value="sizes">Sizes</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Category Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prodSpecsData.categories.map(cat => (
                  <TableRow>
                    <TableCell>{cat.categoryId}</TableCell>
                    <TableCell>{formatName(cat.categoryName)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="series">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Seris Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prodSpecsData.series.map(seriesItem => (
                  <TableRow>
                    <TableCell>{seriesItem.series_id}</TableCell>
                    <TableCell>{formatName(seriesItem.seriesName)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="sizes">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Size Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prodSpecsData.sizes.map(size => (
                  <TableRow>
                    <TableCell>{size.size_id}</TableCell>
                    <TableCell>{formatName(size.size_name)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="colors">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Color Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prodSpecsData.colors.map(color => (
                  <TableRow>
                    <TableCell>{color.color_id}</TableCell>
                    <TableCell>{formatName((color.color_name))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

