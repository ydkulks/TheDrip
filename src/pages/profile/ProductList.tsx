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
import { Product, ApiResponse } from "@/components/types"; // Import types
import { Button } from "@/components/ui/button";
import { ChevronDown, ClipboardPlus, Columns, Filter, Plus, Search, SquarePen, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentTime, toastNotification, tokenDetails } from "@/components/utils"
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

const PAGE_SIZE = 10;

async function getData(page: number, searchTerm: string): Promise<ApiResponse> {
  const tokenData = tokenDetails();
  let url = `http://localhost:8080/api/products?size=${PAGE_SIZE}`; // ID removed for testing
  // let url = `http://localhost:8080/api/products?userId=${tokenData?.id}&size=${PAGE_SIZE}`;

  if (searchTerm) {
    url += `&searchTerm=${searchTerm}`;
  }
  if (page) {
    url += `&page=${page}`;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    toastNotification("Error submitting form", getCurrentTime())
    return { content: [], page: { size: 0, number: 0, totalElements: 0, totalPages: 0 } };
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
  // const tableRef = useRef<HTMLTableElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendRequest, setSendRequest] = useState("");
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number>(5);
  const [maxPrice, setMaxPrice] = useState<number>(100);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiResponse = await getData(
          page,
          searchTerm
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
    setSendRequest(searchTerm);
    setPage(0); // Reset to the first page
  };

  const handleMinPriceChange = (value: number[]) => {
    const newMin = value[0]
    setMinPrice(newMin > maxPrice ? maxPrice : newMin)
  }

  const handleMaxPriceChange = (value: number[]) => {
    const newMax = value[0]
    setMaxPrice(newMax < minPrice ? minPrice : newMax)
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
      // Implement your update logic here
      console.log("Update product:", selectedRow.original);
      toastNotification(
        "Update product",
        getCurrentTime(),
      );
    }
  };

  const handleDeleteProduct = () => {
    if (selectedRow) {
      // Implement your delete logic here
      console.log("Delete product:", selectedRow.original);
      toastNotification(
        "Delete product",
        getCurrentTime(),
      );
    }
  };

  return (
    <>
      <div className="flex justify-between">
        <div className="flex">
          <Dialog>
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="seriesId" className="text-right">
                    Series:
                  </Label>
                  <Input
                    id="seriesId"
                    value={seriesId || ""}
                    onChange={(e) => setSeriesId(e.target.value)}
                    className="col-span-3"
                    placeholder="Enter series name"
                  />
                </div>

                {/* Category Checkboxes 
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Categories:</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <Label htmlFor={`category-${category}`} className="text-sm font-normal cursor-pointer">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>*/}

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

                {/* In Stock Filter */}
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="in-stock" checked={true} onCheckedChange={() => { }} />
                  <Label htmlFor="in-stock" className="cursor-pointer">
                    Show only in-stock items
                  </Label>
                </div>
              </div>

              <DialogFooter className="flex sm:justify-between">
                <Button variant="outline" onClick={() => { }}>
                  Reset Filters
                </Button>
                <Button onClick={() => { }} type="submit">
                  Apply Filters
                </Button>
              </DialogFooter>
            </DialogContent>
            {/*
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filter Products</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="seriesId" className="text-right">
                    Series:
                  </Label>
                  <Input
                    id="seriesId"
                    value={seriesId || ""}
                    onChange={(e) => setSeriesId(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div>
                  <Label>Price Range</Label>
                  <div className="flex gap-2">
                    <div>
                      <Label>Min:</Label>
                      <Slider
                        defaultValue={[minPrice || 0]}
                        max={100}
                        step={10}
                        onValueChange={handleMinPriceChange}
                      />
                    </div>
                    <div>
                      <Label>Max:</Label>
                      <Slider
                        defaultValue={[maxPrice || 100]}
                        max={100}
                        step={10}
                        onValueChange={handleMaxPriceChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>*/}
          </Dialog>
          {/*<Input type="text" placeholder="Search..." className="w-64 m-2" />*/}
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
          {/*<Button variant="outline" className="m-2"><Filter /></Button>*/}
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

      {/* TODO: Display active filters */}

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
