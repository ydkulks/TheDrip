import { Product } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { formatName, getTrendingData } from "@/components/utils"
import { ArrowRight, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";

export default function TrendingNow() {
  const [trendingProducts, setNewArrivalProducts] = useState<Product[]>()
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const placeholder = [
    { productId: 1 },
    { productId: 2 },
    { productId: 3 },
    { productId: 4 },
    { productId: 5 },
  ]

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        const apiResponse = await getTrendingData(5);
        setNewArrivalProducts(apiResponse.content);
        // console.log(apiResponse)
      } catch (error) {
        console.error("Failed to fetch total pages:", error);
      } finally {
        setLoading(false)
      }
    };

    fetchTrendingData()
  }, []);

  if (loading || trendingProducts === undefined || !trendingProducts.length) {
    // NOTE: Loading UI
    return (
      <div className="mx-5">
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {placeholder.map((product) => (
              <CarouselItem key={product.productId} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 mb-2">
                <Skeleton key={product.productId}>
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-md bg-muted flex items-center justify-center mb-2">
                      <Skeleton className="w-[300px] h-[300px] rounded-md" />
                    </div>
                    <div className="flex justify-between mb-1">
                      <Skeleton className="w-[150px] h-5" />
                      <Skeleton className="w-10 h-5" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="w-[150px] h-5" />
                      <Skeleton className="w-10 h-5" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between p-4 pt-0">
                    <div>
                      <Skeleton className="w-10 h-7 mb-1" />
                      <Skeleton className="w-10 h-5" />
                    </div>
                    <div>
                      <Skeleton className="w-10 h-5" />
                    </div>
                  </CardFooter>
                </Skeleton>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-end gap-2 mt-4">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
        <Button variant="outline" size="lg" className="group" onClick={() => { navigate('/shop?filter=trending') }}>
          More
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-5">
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {trendingProducts.map((product) => (
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
      <Button variant="outline" size="lg" className="group" onClick={() => { navigate('/shop?filter=trending') }}>
        More
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  )
}
