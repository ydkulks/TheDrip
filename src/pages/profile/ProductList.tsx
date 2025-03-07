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
import { ChevronDown, ClipboardPlus, Filter, Plus, SquarePen, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentTime, toastNotification } from "@/components/utils"
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

const PAGE_SIZE = 10;

async function getData(page: number): Promise<Product[]> {
  try {
    const response = await fetch(
      `http://localhost:8080/api/products?page=${page}&size=${PAGE_SIZE}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data: ApiResponse = await response.json();
    return data.content;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    toastNotification("Error submitting form", getCurrentTime())
    return []; // Return an empty array in case of error
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

  useEffect(() => {
    const fetchData = async () => {
      const products = await getData(page);
      setData(products);

      try {
        const response = await fetch(
          `http://localhost:8080/api/products?page=${page}&size=${PAGE_SIZE}`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const apiResponse: ApiResponse = await response.json();
        setTotalPages(apiResponse.page.totalPages);
      } catch (error) {
        console.error("Failed to fetch total pages:", error);
      }
    };

    fetchData();
  }, [page]);

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto m-2">
              Columns <ChevronDown />
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
        <div className="flex">
          <Input type="text" placeholder="Search..." className="w-64 m-2" />
          <Button variant="outline" className="m-2"><Filter/></Button>
        </div>
      </div>
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
