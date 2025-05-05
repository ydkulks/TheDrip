import * as React from "react";
import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { columns } from "./columns"; // Import the columns
import { Product } from "@/components/types"; // Import types
import { Button } from "@/components/ui/button";
import { ChevronDown, ClipboardPlus, Columns, Ellipsis, Filter, Images, Plus, Search, SquarePen, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentTime, toastNotification, useTokenDetails, syncProductSpecifications, ProdSpecsType, prodSpecs, formatName, getData, emptyProduct, updateProducts } from "@/components/utils"
import { Card } from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useGrabScroll } from "@/components/hooks/use-grab-scroll";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/components/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";

async function deleteProduct(id: number[]) {
  const token = localStorage.getItem("token");
  let url = `http://localhost:8080/seller/product?productId=${id}`;
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Handle HTTP errors (e.g., 404, 500)
      console.error(`HTTP error! status: ${response.status}`);
      toastNotification("HTTP error! status", getCurrentTime());
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Process the successful response (e.g., parse JSON)
    const data = await response.json();
    console.log("Product deleted successfully:", data);
    return data; // Or return a success status, etc.

  } catch (error) {
    // Handle network errors or exceptions
    console.error("There was an error deleting the product:", error);
    toastNotification("There was an error deleting the product", getCurrentTime());
    throw error; // Re-throw the error to be handled by the caller
  }
}

export default function ProductList() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editedValues, setEditedValues] = useState<Product>(emptyProduct)
  const [totalPages, setTotalPages] = useState(1);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColors, setSelectedColors] = useState<number[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [inStock, setInStock] = useState<boolean | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number>(5);
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [sendRequest, setSendRequest] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const IMG_COUNT = null;
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isGrabMode, setIsGrabMode] = useState(false)
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  const [prodSpecsData, setProdSpecsData] = useState<ProdSpecsType>(prodSpecs);
  const { open } = useSidebar();
  const { decodedToken } = useTokenDetails();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiResponse = await getData(
          decodedToken.id,
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

  useEffect(() => {
    syncProductSpecifications()
      .then((response) => {
        setProdSpecsData(response as ProdSpecsType);
      })
      .catch(error => {
        console.error("Error fetching product specs:", error);
        // Handle the error, e.g., display an error message
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
  const handleSeriesToggle = React.useCallback((seriesId: number) => {
    setSelectedSeries((prevSelected) => {
      if (prevSelected.includes(seriesId)) {
        return prevSelected.filter((id) => id !== seriesId);
      } else {
        return [...prevSelected, seriesId];
      }
    });
  }, [selectedSeries]);
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
    setMaxPrice(200);
    setSelectedColors([]);
    setSelectedSizes([]);
    setInStock(null);
    setSelectedSeries([]);
    setSelectedCategories([]);
  }
  const handleApply = () => {
    setFilterOpen(false);
  }

  const { containerProps } = useGrabScroll({
    ref: tableContainerRef,
    isGrabMode,
  })
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault() // Prevent default space bar scrolling
        setIsGrabMode(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault() // Prevent default space bar scrolling
        setIsGrabMode(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown, { passive: false })
    window.addEventListener("keyup", handleKeyUp, { passive: false })

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [isGrabMode])

  const handleEdit = (product: Product) => {
    setEditingId(product.productId);
    setEditedValues(product);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedValues(emptyProduct);
  };

  const handleChange = (
    field: keyof Product,
    value: string | number | string[]
  ) => {
    setEditedValues((prev) => {
      // For "colors" and "sizes", treat value as a single string (option to toggle)
      if (field === "colors" || field === "sizes") {
        // Ensure we have an array (or default to an empty array)
        const currentSelections = Array.isArray(prev[field])
          ? (prev[field] as string[])
          : [];
        // Assume value is a string representing the new selection
        const newValue = value as string;
        // Toggle the selection: remove if already exists, add if not
        const updatedSelections = currentSelections.includes(newValue)
          ? currentSelections.filter((item) => item !== newValue)
          : [...currentSelections, newValue];

        return {
          ...prev,
          [field]: updatedSelections,
        };
      }
      // For other fields, simply replace the value
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleSave = () => {
    try {
      if (!editedValues?.productDescription || editedValues.productDescription.trim() === "") {
        throw new Error("Product Description cannot be empty");
      }
      if (isNaN(Number(editedValues.productPrice)) || Number(editedValues.productPrice) <= 0) {
        throw new Error("Price must be a positive number");
      }
      if (isNaN(Number(editedValues.productStock)) || Number(editedValues.productStock) < 0) {
        throw new Error("Stock must be a non-negative number");
      }
      if (!Array.isArray(editedValues.colors) || editedValues.colors.length === 0) {
        throw new Error("Invalid Colors");
      }
      if (!Array.isArray(editedValues.sizes) || editedValues.sizes.length === 0) {
        throw new Error("Invalid Sizes");
      }

      const categoryObj = prodSpecsData.categories.find(obj => obj.categoryName === editedValues.categoryName);
      const seriesObj = prodSpecsData.series.find(obj => obj.seriesName === editedValues.seriesName);
      const transformedValues = {
        ...editedValues,
        categoryId: editedValues.categoryName ?
          (categoryObj ? categoryObj.categoryId : null)
          : 0,
        seriesId: editedValues.seriesName ? (
          seriesObj ? seriesObj.series_id : null
        ) : 0,
        productColors: Array.isArray(editedValues.colors)
          ? editedValues.colors
            .map((colorName) => {
              const colorObj = prodSpecsData.colors.find((obj) => obj.color_name === colorName);
              return colorObj ? colorObj.color_id : null;
            })
            .filter((id): id is number => id !== null) // Remove null values
          : [],
        productSizes: Array.isArray(editedValues.sizes)
          ? editedValues.sizes
            .map((sizeName) => {
              const sizeObj = prodSpecsData.sizes.find((obj) => obj.size_name === sizeName);
              return sizeObj ? sizeObj.size_id : null;
            })
            .filter((id): id is number => id !== null) // Remove null values
          : [],
      };

      // console.log(transformedValues);
      // console.log("Before convertion:", editedValues.colors, editedValues.sizes);
      // console.log("Final Edited Values:", transformedValues.colors, transformedValues.sizes);
      updateProducts(transformedValues)
        .then(() => {
          setData((prev) =>
            prev.map((product) =>
              product.productId === editedValues.productId
                ? ({ ...product, ...editedValues } as Product)
                : product
            )
          );
          setEditingId(null);
          toastNotification(
            "Product updated",
            `${editedValues.productName} has been successfully updated.`,
          );
        });

    } catch (error: any) {
      toastNotification("Error", error.message);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    meta: {
      editingId,
      editedValues,
      handleEdit,
      handleCancel,
      handleChange,
      handleSave,
      prodSpecsData,
    }
  });

  // Context Menu
  const navigate = useNavigate();
  const handleNewProduct = () => {
    navigate('/profile/product_details', { replace: true });
  };

  const handleCopyProductId = () => {
    const rows = table.getSelectedRowModel().flatRows.map((row) => row.original.productId)
    if (rows.length >= 1) {
      navigator.clipboard.writeText(
        rows.join("\n")
      );
      toastNotification(
        "Product ID copied to clipboard",
        getCurrentTime(),
      );
    }
    return undefined;
  };

  const handleUpdateProduct = () => {
    const rows = table.getSelectedRowModel().flatRows.map((row) => row.original.productId)
    if (rows.length >= 1) {
      navigate(`/profile/product_update?productId=${rows}`, { replace: true });
    }
    // if (rows.length <= 1) {
    //   toastNotification("You can Inline update for single product", getCurrentTime());
    // }
  };

  const handleUploadImages = () => {
    const rows = table.getSelectedRowModel().flatRows.map((row) => row.original.productId)
    if (rows.length >= 1) {
      navigate(`/profile/product_images?productId=${rows}`, { replace: true });
    }
    // if (rows.length > 1) {
    //   toastNotification("Cannot upload for more then one product at a time", getCurrentTime());
    // }
  };

  const handleOpenConfirmation = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length > 0) {
      setIsConfirmationOpen(true);
    }
  };

  const handleDeleteProduct = () => {
    const rows = table.getSelectedRowModel().flatRows.map((row) => row.original.productId)
    if (rows.length >= 1) {
      deleteProduct(rows)
        .then(_result => {
          // console.log(result);
          toastNotification("Deleted product", getCurrentTime());
          handleSearch();
        });
    }
  };

  const isMobile = useIsMobile();
  const sidebarWidth = 256;
  var containerMaxWidth = '100vw'
  if (!isMobile) {
    containerMaxWidth = open ? `calc(100vw - ${sidebarWidth}px)` : '100vw';
  }
  return (
    <div style={{ maxWidth: containerMaxWidth }}>
      <div className="flex flex-wrap justify-between">
        <div className="flex">
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
                        <Slider id="min-price" value={[minPrice]} max={200} step={5} onValueChange={handleMinPriceChange} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="max-price" className="text-xs">
                            Max: ${maxPrice}
                          </Label>
                        </div>
                        <Slider id="max-price" value={[maxPrice]} max={200} step={5} onValueChange={handleMaxPriceChange} />
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
            className="w-60 my-2 ml-0 md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <Button variant="outline" className="m-2" onClick={handleSearch}>
            <Search />
          </Button>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto m-2">
                <Columns />{isMobile ? null : "Columns"} <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto m-2">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              <DropdownMenuLabel>Table Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleNewProduct}>
                  Create Product
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem disabled={table.getFilteredSelectedRowModel().rows.length >= 1 ? false : true} onClick={handleUpdateProduct}>
                  Update Product
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem disabled={table.getFilteredSelectedRowModel().rows.length >= 1 ? false : true} onClick={handleUploadImages}>
                  Upload Images
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem disabled={table.getFilteredSelectedRowModel().rows.length >= 1 ? false : true} onClick={handleOpenConfirmation}>
                  Delete Products
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Display active filters */}
      {inStock !== null || selectedColors.length > 0 || selectedSizes.length > 0 || selectedSeries.length > 0 || selectedCategories.length > 0 || minPrice != 5 || maxPrice != 200 ?
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
          {minPrice != 5 || maxPrice != 200 ?
            <Card className="mx-2 p-2">
              <Label className="flex-inline self-center">Price Range: </Label>
              <Badge className="mx-2">${minPrice}</Badge>
              <Badge className="mx-2">${maxPrice}</Badge>
            </Card> : null}
        </div>
        : null}

      {/*<ContextMenu open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>*/}
      <ContextMenu>
        <ContextMenuTrigger>
          <Card className="m-2">
            <div
              ref={tableContainerRef}
              {...containerProps}
              className={`overflow-auto ${isGrabMode ? "cursor-grab active:cursor-grabbing select-none" : ""}`}
              style={{
                overflowX: "auto", // Ensure horizontal scrolling is enabled
                width: "100%", // Take full width
                // position: "relative",
              }}
            >
              <div className="min-w-max">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => {
                        return (
                          <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                            {row.getVisibleCells().map((cell) => {
                              return (
                                <TableCell key={cell.id}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          {/*No results.*/}
                          <Link to="/profile/product_details">
                            <Button variant="default">Create New Product</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem onClick={handleNewProduct} className="gap-2">
            <Plus size={16} />
            <span className=""> Create New Product</span>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            disabled={table.getFilteredSelectedRowModel().rows.length >= 1 ? false : true}
            onClick={handleCopyProductId}
            className="gap-2">
            <ClipboardPlus size={16} />
            Copy Selected Product ID
            <ContextMenuShortcut>⌘⇧C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            disabled={table.getFilteredSelectedRowModel().rows.length >= 1 ? false : true}
            onClick={handleUpdateProduct}
            className="gap-2">
            <SquarePen size={16} />
            Update Selected
            <ContextMenuShortcut>⌘E</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            disabled={table.getFilteredSelectedRowModel().rows.length >= 1 ? false : true}
            onClick={handleUploadImages}
            className="gap-2">
            <Images size={16} />
            Upload Images
            <ContextMenuShortcut>⌘I</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            disabled={table.getFilteredSelectedRowModel().rows.length >= 1 ? false : true}
            onClick={handleOpenConfirmation}
            className="gap-2">
            <Trash size={16} />
            Delete Selected
            <ContextMenuShortcut>⌘⇧D</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
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
      <AlertDialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete selected products?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct}> Delete </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
