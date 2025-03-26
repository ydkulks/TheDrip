import { useIsMobile } from "@/components/hooks/use-mobile";
import { Product } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { formatName, getData, prodSpecs, ProdSpecsType, syncProductSpecifications } from "@/components/utils";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { Label } from "@radix-ui/react-label";
import { ChevronDown, Filter, Search, SortAsc, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const sortBtns = [
  { name: "New Arrivals", value: "product_created" },
  { name: "Most Popular", value: "product_sold" },
  { name: "Name", value: "product_name" },
  { name: "Stock", value: "product_stock" },
  { name: "Price: High to Low", value: "product_price_dec" },
  { name: "Price: Low to High", value: "product_price_asc" },
];

const Shop = () => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColors, setSelectedColors] = useState<number[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [inStock, setInStock] = useState<boolean | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number>(5);
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [sendRequest, setSendRequest] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const IMG_COUNT = 1
  const [selectedSort, setSelectedSort] = useState<string | undefined>(undefined)
  const [prodSpecsData, setProdSpecsData] = useState<ProdSpecsType>(prodSpecs);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiResponse = await getData(
          null,
          page,
          searchTerm,
          selectedColors,
          selectedSizes,
          inStock,
          selectedCategories,
          selectedSeries,
          IMG_COUNT,
          minPrice,
          maxPrice
        );
        setData(apiResponse.content);
        setTotalPages(apiResponse.page.totalPages);
      } catch (error) {
        console.error("Failed to fetch total pages:", error);
      }
    };

    fetchData();
  }, [page, sendRequest]);

  // Searching and Filtering
  const handleSearch = () => {
    // Trigger re-fetch with the current searchTerm
    setSendRequest(!sendRequest);
    setPage(0); // Reset to the first page
    // console.log(minPrice, maxPrice, seriesId);
  };

  // let prodSpecsData: ProdSpecsType = prodSpecs;
  useEffect(() => {
    syncProductSpecifications()
      .then((response) => {
        // prodSpecsData = response as ProdSpecsType;
        setProdSpecsData(response as ProdSpecsType);
      });
  }, [])

  const handleColorToggle = (colorId: number) => {
    setSelectedColors((prevSelected) => {
      if (prevSelected.includes(colorId)) {
        return prevSelected.filter((id) => id !== colorId);
      } else {
        return [...prevSelected, colorId];
      }
    });
  };
  const handleSizeToggle = (sizeId: number) => {
    setSelectedSizes((prevSelected) => {
      if (prevSelected.includes(sizeId)) {
        return prevSelected.filter((id) => id !== sizeId);
      } else {
        return [...prevSelected, sizeId];
      }
    });
  };
  const handleInStockChange = (value: boolean | null) => {
    setInStock(value);
  }
  const handleSeriesToggle = (seriesId: number) => {
    setSelectedSeries((prevSelected) => {
      if (prevSelected.includes(seriesId)) {
        return prevSelected.filter((id) => id !== seriesId);
      } else {
        return [...prevSelected, seriesId];
      }
    });
  };
  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prevSelected) => {
      if (prevSelected.includes(categoryId)) {
        return prevSelected.filter((id) => id !== categoryId);
      } else {
        return [...prevSelected, categoryId];
      }
    });
  };

  // Handling sort
  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    console.log("Selected value:", value);
  };
  const sortedData = useMemo(() => {
    if (!selectedSort) {
      return [...data]; // Return a copy of the original data if no sorting is selected
    }

    const sorted = [...data]; // Create a copy to avoid mutating the original array

    sorted.sort((a, b) => {
      switch (selectedSort) {
        case "product_name":
          return a.productName.localeCompare(b.productName);
        case "product_stock":
          return a.productStock - b.productStock;
        case "product_sold":
          return 0; //add real comparison, assuming product_sold is a field on Product type
        case "product_created":
          return 0; //add real comparison, assuming product_created is a field on Product type
        case "product_price_asc":
          return a.productPrice - b.productPrice;
        case "product_price_dec":
          return b.productPrice - a.productPrice; // Descending order
        default:
          return 0; // No sorting
      }
    });
    return sorted;
  }, [data, selectedSort]);

  // For displaying in filters selected
  const getColorNames = (colorIds: number[]): string[] => {
    return prodSpecsData.colors
      .filter((color) => colorIds.includes(color.color_id))
      .map((color) => color.color_name);
  };
  const getSizeNames = (sizeIds: number[]): string[] => {
    return prodSpecsData.sizes
      .filter((size) => sizeIds.includes(size.size_id))
      .map((size) => size.size_name);
  };
  const getCategoryNames = (categoryIds: number[]): string[] => {
    return prodSpecsData.categories
      .filter((category) => categoryIds.includes(category.categoryId))
      .map((category) => category.categoryName);
  };
  const getSeriesNames = (seriesIds: number[]): string[] => {
    return prodSpecsData.series
      .filter((series) => seriesIds.includes(series.series_id))
      .map((series) => series.seriesName);
  };

  const handleMinPriceChange = (value: number[]) => {
    const newMin = value[0]
    setMinPrice(newMin > maxPrice ? maxPrice : newMin)
  }

  const handleMaxPriceChange = (value: number[]) => {
    const newMax = value[0]
    setMaxPrice(newMax < minPrice ? minPrice : newMax)
  }

  const handleReset = () => {
    setMinPrice(5);
    setMaxPrice(100);
    setSelectedColors([]);
    setSelectedSizes([]);
    setInStock(null);
    setSelectedSeries([]);
    setSelectedCategories([]);
  }
  const handleApply = () => {
    setFilterOpen(false);
  }

  const isMobile = useIsMobile();

  return (
    <>
      <div className="flex justify-between flex-wrap xl:mx-2 2xl:mx-[10%]">
        <div className="flex flex-wrap-reverse">
          <Drawer open={filterOpen} onOpenChange={setFilterOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="m-2">
                <Filter /> {isMobile ? null : "Filter"}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="m-2">
              <ScrollArea className="h-[500px] p-5">
                <DrawerHeader>
                  <DrawerTitle>Filter Products</DrawerTitle>
                  <DrawerDescription>Filter to find the product you are looking for.</DrawerDescription>
                </DrawerHeader>
                <div className="grid gap-4 py-4">
                  {/* Series Input */}
                  <div className="space-y-2">
                    <DrawerTitle>Series</DrawerTitle>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {prodSpecsData.series.map((seriesItem) => (
                        <div key={seriesItem.series_id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`series-${seriesItem.series_id}`}
                            checked={selectedSeries.includes(seriesItem.series_id)}
                            onCheckedChange={() => handleSeriesToggle(seriesItem.series_id)}
                          />
                          <Label htmlFor={`series-${seriesItem.series_id}`} className="text-sm font-normal cursor-pointer">
                            {formatName(seriesItem.seriesName)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category Checkboxes */}
                  <div className="space-y-2">
                    <DrawerTitle>Categories</DrawerTitle>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {prodSpecsData.categories.map((category) => (
                        <div key={category.categoryId} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.categoryId}`}
                            checked={selectedCategories.includes(category.categoryId)}
                            onCheckedChange={() => handleCategoryToggle(category.categoryId)}
                          />
                          <Label htmlFor={`category-${category.categoryId}`} className="text-sm font-normal cursor-pointer">
                            {formatName(category.categoryName)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>


                  {/* Price Range */}
                  <div className="space-y-4">
                    <DrawerTitle>Price Range</DrawerTitle>

                    <div className="space-y-4 px-2">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="min-price" className="text-xs">
                            Min: ${minPrice}
                          </Label>
                        </div>
                        <Slider id="min-price" value={[minPrice]} max={100} step={5} onValueChange={handleMinPriceChange} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="max-price" className="text-xs">
                            Max: ${maxPrice}
                          </Label>
                        </div>
                        <Slider id="max-price" value={[maxPrice]} max={100} step={5} onValueChange={handleMaxPriceChange} />
                      </div>
                    </div>
                  </div>

                  {/* Color Checkboxes */}
                  <div className="space-y-2">
                    <DrawerTitle>Colors</DrawerTitle>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {prodSpecsData.colors.map((color) => (
                        <div key={color.color_id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`color-${color.color_id}`}
                            checked={selectedColors.includes(color.color_id)}
                            onCheckedChange={() => handleColorToggle(color.color_id)}
                          />
                          <Label htmlFor={`color-${color.color_id}`} className="text-sm font-normal cursor-pointer">
                            {formatName(color.color_name)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Size Checkboxes */}
                  <div className="space-y-2">
                    <DrawerTitle>Sizes</DrawerTitle>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {prodSpecsData.sizes.map((size) => (
                        <div key={size.size_id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`size-${size.size_id}`}
                            checked={selectedSizes.includes(size.size_id)}
                            onCheckedChange={() => handleSizeToggle(size.size_id)}
                          />
                          <Label htmlFor={`size-${size.size_id}`} className="text-sm font-normal cursor-pointer">
                            {formatName(size.size_name)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* In Stock Filter */}
                  <div className="text-sm items-center space-x-2 pt-2">
                    <DrawerTitle className="mb-2">Stock</DrawerTitle>
                    <RadioGroup
                      value={inStock === null ? "null" : inStock.toString()}
                      onValueChange={(value) => handleInStockChange(value === "null" ? null : value === "true")}
                      className="flex items-center space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="null" id="all" />
                        <Label htmlFor="all">All Products</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="inStock" />
                        <Label htmlFor="inStock">In Stock Only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="outOfStock" />
                        <Label htmlFor="outOfStock">Out of Stock Only</Label>
                      </div>
                    </RadioGroup>

                  </div>
                </div>
                <DrawerFooter>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset}>
                      Reset Filters
                    </Button>
                    <DrawerClose asChild>
                      <Button onClick={handleApply} type="submit">
                        Apply Filters
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerFooter>
              </ScrollArea>
            </DrawerContent>
          </Drawer>
          <Input
            type="text"
            placeholder="Search..."
            className="w-52 md:w-64 m-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <Button variant="outline" className="m-2 ml-0" onClick={handleSearch}>
            <Search />
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto m-2">
              <SortAsc />Sort By <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={selectedSort} onValueChange={handleSortChange}>
              {sortBtns.map(btn => (
                <DropdownMenuRadioItem key={btn.value} value={btn.value}>{btn.name}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Display active filters */}
      {inStock !== null || selectedColors.length > 0 || selectedSizes.length > 0 || selectedSeries.length > 0 || selectedCategories.length > 0 || minPrice != 5 || maxPrice != 100 ?
        <div className="flex flex-wrap">
          {inStock === null ? null :
            <Card className="flex flex-wrap mx-2 p-2 gap-2">
              <Label className="flex-inline self-center">Selected State: </Label>
              {inStock ? <Badge>In Stock</Badge> : <Badge>Out of Stock</Badge>}
            </Card>
          }
          {selectedColors.length > 0 ?
            <Card className="flex flex-wrap mx-2 p-2 gap-2">
              <Label className="flex-inline self-center">Colors: </Label>
              {getColorNames(selectedColors).map((name) => (
                <Badge key={name}>{formatName(name)}</Badge>
              ))}
            </Card> : null
          }
          {selectedSizes.length > 0 ?
            <Card className="flex flex-wrap mx-2 p-2 gap-2">
              <Label className="flex-inline self-center">Sizes: </Label>
              {getSizeNames(selectedSizes).map((name) => (
                <Badge key={name}>{formatName(name)}</Badge>
              ))}
            </Card> : null
          }
          {selectedSeries.length > 0 ?
            <Card className="flex flex-wrap mx-2 p-2 gap-2">
              <Label className="flex-inline self-center">Series: </Label>
              {getSeriesNames(selectedSeries).map((name) => (
                <Badge key={name}>{formatName(name)}</Badge>
              ))}
            </Card> : null
          }
          {selectedCategories.length > 0 ?
            <Card className="flex flex-wrap mx-2 p-2 gap-2">
              <Label className="flex-inline self-center">Categories: </Label>
              {getCategoryNames(selectedCategories).map((name) => (
                <Badge key={name}>{formatName(name)}</Badge>
              ))}
            </Card> : null
          }
          {minPrice != 5 || maxPrice != 100 ?
            <Card className="mx-2 p-2">
              <Label className="flex-inline self-center">Price Range: </Label>
              <Badge className="mx-2">${minPrice}</Badge>
              <Badge className="mx-2">${maxPrice}</Badge>
            </Card> : null}
        </div>
        : null}

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedData.length > 0 ? sortedData.map((product) => (
            <Card key={product.productId} className="cursor-pointer hover:bg-accent">
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
          )) : null}
        </div>
        {sortedData.length <= 0 ?
          <>
          <h3 className="font-integralcf text-center">No product found</h3>
        </> : null}
      </div>
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
    </>
  )
}
export default Shop;
