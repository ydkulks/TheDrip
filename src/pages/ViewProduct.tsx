import { Product } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getCurrentTime, toastNotification } from "@/components/utils";
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

async function getProduct(productId: number): Promise<Product | null> {
  let url = `http://localhost:8080/api/product?id=${productId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data: Product = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    toastNotification("Failed to fetch products", getCurrentTime())
    return null;
  }
}

const emptyProduct: Product = {
  productId: 0,
  productName: "Product Name",
  productDescription: "Product Description",
  productPrice: 0,
  productStock: 0,
  seriesName: "Series Name",
  categoryName: "Category Name",
  sellerName: "Seller Name",
  images: ["https://placehold.co/100x100"],
  sizes: ["small"],
  colors: ["original"],
}

const ViewProduct = () => {
  const [searchParams] = useSearchParams();
  const productIdParam = searchParams.get('productId');
  const [data, setData] = useState<Product>(emptyProduct);
  const [loading, setLoading] = useState(true);  // Add a loading state

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(data?.sizes[2] || data?.sizes[0])
  const [selectedColor, setSelectedColor] = useState(data?.colors[0])
  const [quantity, setQuantity] = useState(1)

  let productId: number | null = null;

  if (productIdParam) {
    const parsedProductId = parseInt(productIdParam, 10);

    if (!isNaN(parsedProductId)) {
      productId = parsedProductId;
    } else {
      console.error("Invalid productId in URL:", productIdParam);
      // Handle the error (e.g., redirect, display a message)
    }
  }

  useEffect(() => {
    const fetchData = async (pid: number) => {
      setLoading(true); // Set loading to true before fetch

      try {
        const apiResponse = await getProduct(pid);
        setData(apiResponse as Product);
      } catch (error) {
        console.error("Failed to fetch total pages:", error);
      } finally {
        setLoading(false); // Set loading to false after fetch
      }
    };

    if (typeof productId === "number") {
      const pid: number = productId;
      fetchData(pid);
    }
  }, [productId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? data.images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === data.images.length - 1 ? 0 : prev + 1))
  }
  const handleAddToCart = () => {
    toastNotification(
      "Added to cart",
      `${quantity} ${data.productName} (${selectedColor}, ${selectedSize}) added to your cart.`,
    )
  }
  const handleBuyNow = async () => {
    toastNotification("Processing payment", "Redirecting to Stripe checkout...",)
  }
  return (
    <>
      {data ? (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border">
              <img
                src={data.images[selectedImage] || "/placeholder.svg"}
                alt={data.productName}
                className="object-cover"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous image</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next image</span>
              </Button>
            </div>
            <div className="flex space-x-2 overflow-auto pb-2">
              {data.images.map((image, index) => (
                <button
                  key={index}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border ${selectedImage === index ? "ring-2 ring-primary" : ""
                    }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${data.productName} thumbnail ${index + 1}`}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{data.productName}</h1>
                  <p className="text-muted-foreground">{data.seriesName}</p>
                </div>
                <div className="text-2xl font-bold">${data.productPrice.toFixed(2)}</div>
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <Badge variant="outline">{data.categoryName}</Badge>
                <Badge variant="outline">Sold by: {data.sellerName}</Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="mt-2 text-muted-foreground">{data.productDescription}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold">Size</h2>
                <RadioGroup className="mt-2 flex flex-wrap gap-2" value={selectedSize} onValueChange={setSelectedSize}>
                  {data.sizes.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
                      <Label
                        htmlFor={`size-${size}`}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-muted bg-background peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                      >
                        {size}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <h2 className="text-lg font-semibold">Color</h2>
                <RadioGroup className="mt-2 flex flex-wrap gap-2" value={selectedColor} onValueChange={setSelectedColor}>
                  {data.colors.map((color) => (
                    <div key={color} className="flex items-center space-x-2">
                      <RadioGroupItem value={color} id={`color-${color}`} className="peer sr-only" />
                      <Label
                        htmlFor={`color-${color}`}
                        className="flex h-10 cursor-pointer items-center justify-center rounded-md border border-muted bg-background px-3 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                      >
                        {color}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <h2 className="text-lg font-semibold">Quantity</h2>
                <div className="mt-2 flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Decrease quantity</span>
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.min(data.productStock, q + 1))}
                    disabled={quantity >= data.productStock}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Increase quantity</span>
                  </Button>
                  <span className="text-sm text-muted-foreground">{data.productStock} available</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <Button className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <Button className="flex-1" variant="secondary" onClick={handleBuyNow}>
                Order Now with Stripe
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div>No Products Found</div>
      )}
    </>
  )
}

export default ViewProduct;
