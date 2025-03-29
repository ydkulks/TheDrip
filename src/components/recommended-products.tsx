import type { Product } from "@/components/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { formatName, getData } from "@/components/utils"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Badge } from "./ui/badge"
import { Star } from "lucide-react"
import { Separator } from "./ui/separator"

interface RecommendedProductsProps {
  series: number
  seriesName: string
  category: number
  categoryName: string
}

export const RecommendedProducts = ({ series, seriesName, category, categoryName }: RecommendedProductsProps) => {
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([])
  const [seriesProducts, setSeriesProducts] = useState<Product[]>([])
  const [selectedSeries, setSelectedSeries] = useState<number[]>(series != null ? [series] : []);
  const [selectedCategories, setSelectedCategories] = useState<number[]>(category != null ? [category] : []);
  const [minPrice, _setMinPrice] = useState<number>(5);
  const [maxPrice, _setMaxPrice] = useState<number>(200);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryData = async () => {
      // console.log(category, categoryName);
      try {
        if (category != null) {
          setSelectedCategories([category])
          // console.log(selectedCategories);
          const apiResponse = await getData(
            null, 0, "", [], [],
            null, selectedCategories, [], 1,
            minPrice, maxPrice
          );
          setCategoryProducts(apiResponse.content);
        }
      } catch (error) {
        console.error("Failed to fetch total pages:", error);
      } finally {
        setLoading(false)
      }
    };

    fetchCategoryData()
  }, [category]);

  useEffect(() => {
    const fetchSeriesData = async () => {
      // console.log(series, seriesName);
      try {
        if (series != null) {
          setSelectedSeries([series])
          // console.log(selectedSeries);
          const apiResponse = await getData(
            null, 0, "", [], [],
            null, [], selectedSeries, 1,
            minPrice, maxPrice
          );
          setSeriesProducts(apiResponse.content);
        }
      } catch (error) {
        console.error("Failed to fetch total pages:", error);
      } finally {
        setLoading(false)
      }
    };

    fetchSeriesData()
  }, [series]);

  if (loading) {
    return <div className="mt-8">Loading recommended products...</div>
  }
  // const seriesName = seriesProducts.find(name => name.seriesName === se)
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>

      {/* Categories */}
      <h3 className="inline-flex text-1xl font-bold mb-6">Category
        <Separator orientation="vertical" className="mx-2 h-4" />
        <span className="text-muted-foreground font-normal">{formatName(categoryName)}</span>
      </h3>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {categoryProducts.map((product) => (
            <CarouselItem key={product.productId} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 mb-2">
              <Card key={product.productId} className="cursor-pointer hover:shadow-md transition-shadow">
                <Link to={`/shop/view-product?productId=${product.productId}`}>
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-md bg-muted flex items-center justify-center mb-2">
                      <img
                        className="rounded-md"
                        src={product.images[0] || "https://placehold.co/300x300?text=No+Image"}
                        alt={product.productName}
                      />
                    </div>
                    <div className="flex justify-between">
                      <h3 className="font-medium my-2">{product.productName}</h3>
                      <Badge variant="outline" className="inline-flex text-sm gap-1 my-2">
                        4.5<Star size="15" />
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">{product.seriesName}</p>
                      <Badge variant="outline" className="text-sm">{formatName(product.categoryName)}</Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between p-4 pt-0">
                    <div>
                      <span className="font-medium">${product.productPrice}</span>
                      <span className="font-normal text-sm line-through text-muted-foreground ml-2">
                        ${product.productPrice}
                      </span>
                    </div>
                    <div>
                      <span className={`text-xs ${product.productStock > 0 ? "text-green-600" : "text-red-600"}`}>
                        {product.productStock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </CardFooter>
                </Link>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-end gap-2 mt-4">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>

      {/* Series */}
      <h3 className="text-1xl font-bold mb-6 inline-flex">Series
        <Separator orientation="vertical" className="mx-2 h-4" />
        <span className="text-muted-foreground font-normal">{seriesName}</span>
      </h3>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {seriesProducts.map((product) => (
            <CarouselItem key={product.productId} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 mb-2">
              <Card key={product.productId} className="cursor-pointer hover:shadow-md transition-shadow">
                <Link to={`/shop/view-product?productId=${product.productId}`}>
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-md bg-muted flex items-center justify-center mb-2">
                      <img
                        className="rounded-md"
                        src={product.images[0] || "https://placehold.co/300x300?text=No+Image"}
                        alt={product.productName}
                      />
                    </div>
                    <div className="flex justify-between">
                      <h3 className="font-medium my-2">{product.productName}</h3>
                      <Badge variant="outline" className="inline-flex text-sm gap-1 my-2">
                        4.5<Star size="15" />
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">{product.seriesName}</p>
                      <Badge variant="outline" className="text-sm">{formatName(product.categoryName)}</Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between p-4 pt-0">
                    <div>
                      <span className="font-medium">${product.productPrice}</span>
                      <span className="font-normal text-sm line-through text-muted-foreground ml-2">
                        ${product.productPrice}
                      </span>
                    </div>
                    <div>
                      <span className={`text-xs ${product.productStock > 0 ? "text-green-600" : "text-red-600"}`}>
                        {product.productStock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </CardFooter>
                </Link>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-end gap-2 mt-4">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  )
}
