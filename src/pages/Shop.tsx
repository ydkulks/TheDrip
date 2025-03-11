import { Product } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatName, getData, prodSpecs, ProdSpecsType, syncProductSpecifications } from "@/components/utils";
import { Label } from "@radix-ui/react-label";
import { Filter, Search, ShoppingCart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Shop = () => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  // TODO: Implement sort
  // const [sorting, setSorting] = React.useState<SortingState>([]);
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

  let prodSpecsData: ProdSpecsType = prodSpecs;
  useEffect(() => {
    syncProductSpecifications()
      .then((response) => {
        prodSpecsData = response as ProdSpecsType;
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
      .map((series) => series.series_name);
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

  return (
    <>
      <div className="flex">
        <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="m-2">
              <Filter /> Filter
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Filter Products</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Series Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Series:</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {prodSpecsData.series.map((index) => (
                    <div key={index.series_id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`series-${index.series_id}`}
                        checked={selectedSeries.includes(index.series_id)}
                        onCheckedChange={() => handleSeriesToggle(index.series_id)}
                      />
                      <Label htmlFor={`series-${index.series_id}`} className="text-sm font-normal cursor-pointer">
                        {formatName(index.series_name)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Checkboxes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Categories:</Label>
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
                <Label className="text-sm font-medium">Price Range:</Label>

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
                <Label className="text-sm font-medium">Colors:</Label>
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
                <Label className="text-sm font-medium">Sizes:</Label>
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
              <div className="flex text-sm items-center space-x-2 pt-2">
                <div>
                  <label>
                    <input
                      className="mr-2"
                      type="radio"
                      value="null"
                      checked={inStock === null}
                      onChange={() => handleInStockChange(null)}
                    />
                    All Products
                  </label>
                </div>
                <div>
                  <label>
                    <input
                      className="mr-2"
                      type="radio"
                      value="true"
                      checked={inStock === true}
                      onChange={() => handleInStockChange(true)}
                    />
                    In Stock Only
                  </label>
                </div>
                <div>
                  <label>
                    <input
                      className="mr-2"
                      type="radio"
                      value="false"
                      checked={inStock === false}
                      onChange={() => handleInStockChange(false)}
                    />
                    Out of Stock Only
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="flex sm:justify-between">
              <Button variant="outline" onClick={handleReset}>
                Reset Filters
              </Button>
              <Button onClick={handleApply} type="submit">
                Apply Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Input
          type="text"
          placeholder="Search..."
          className="w-64 m-2"
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
      {/* TODO: Display active filters */}

      <div>
        {inStock === null ? null :
          <>
            <span>Selected State: </span>
            {inStock ? "In Stock" : "Out of Stock"}
          </>
        }
        {selectedColors.length > 0 ?
          <>
            <span>Colors: </span>
            {getColorNames(selectedColors).map((name) => (
              <Badge key={name}>{formatName(name)}</Badge>
            ))}
          </> : null
        }
        {selectedSizes.length > 0 ?
          <>
            <span>Sizes: </span>
            {getSizeNames(selectedSizes).map((name) => (
              <Badge key={name}>{formatName(name)}</Badge>
            ))}
          </> : null
        }
        {selectedSeries.length > 0 ?
          <>
            <span>Series: </span>
            {getSeriesNames(selectedSeries).map((name) => (
              <Badge key={name}>{formatName(name)}</Badge>
            ))}
          </> : null
        }
        {selectedCategories.length > 0 ?
          <>
            <span>Categories: </span>
            {getCategoryNames(selectedCategories).map((name) => (
              <Badge key={name}>{formatName(name)}</Badge>
            ))}
          </> : null
        }
        {minPrice != 5 || maxPrice != 100 ?
          <>
            <span>Min. Price: </span><Badge>${minPrice}</Badge>
            <span>Max. Price: </span><Badge>${maxPrice}</Badge>
          </> : null}
      </div>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.length > 0 ? data.map((product) => (
            <Card key={product.productId} className="cursor-pointer">
              <Link to="/">
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
          )) : <>
            <h3 className="font-integralcf text-center">No product found!</h3>
          </>}
        </div>
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
