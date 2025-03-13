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
  Row,
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
import { ChevronDown, ClipboardPlus, Columns, Filter, Plus, Search, SquarePen, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentTime, toastNotification, tokenDetails, syncProductSpecifications, ProdSpecsType, prodSpecs, formatName, getData } from "@/components/utils"
import { Card } from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  const [totalPages, setTotalPages] = useState(1);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [selectedRow, setSelectedRow] = useState<Row<Product> | null>(null); // Track selected row
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
  const IMG_COUNT = null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiResponse = await getData(
          tokenDetails().id,
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
  });

  // Context Menu
  const navigate = useNavigate();
  const handleNewProduct = () => {
    navigate('/profile/productdetails', { replace: true });
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
    if (selectedRow) {
      console.log("Selected Row:", selectedRow);
    }
    const rows = table.getSelectedRowModel().flatRows.map((row) => row.original.productId)
    if (rows.length >= 1) {
      console.log("Update product:", rows);
      toastNotification("Update product", getCurrentTime());
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

  return (
    <>
      <div className="flex flex-wrap justify-between">
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
                  <Label className="text-sm font-medium">Stock:</Label>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto m-2">
              <Columns />Columns <ChevronDown />
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

      {/*<ContextMenu open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>*/}
      <ContextMenu onOpenChange={() => setSelectedRow(null)}>
        <ContextMenuTrigger>
          <Card className="m-2 overflow-y-scroll">
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
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
            onClick={handleDeleteProduct}
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

    </>
  );
}
