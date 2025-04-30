import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Assuming you have these shadcn components
import { formatName } from "@/components/utils";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { useGrabScroll } from "@/components/hooks/use-grab-scroll";
import { useIsMobile } from "@/components/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
// import { cn } from "@/lib/utils"; // Assuming you have a utility function like this

interface Orders {
  userId: number;
  productId: number;
  quantity: number;
  orderAmount: number;
  orderStatus: string;
  productName: string;
  category: string;
  series: string;
}

interface OrdersPage {
  content: Orders[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

interface Props {
  custOrders: OrdersPage | undefined; // Ensure custOrders is optional or handled
}

const columns: ColumnDef<Orders>[] = [
  {
    accessorKey: "productId",
    header: "Product ID",
  },
  {
    accessorKey: "productName",
    header: "Product Name",
    cell: ({ row }) => {
      const prodLink = `/shop/view-product?productId=${row.original.productId}`
      return (
        <Link to={prodLink}
          className="font-bold hover:underline">
          {row.original.productName}
        </Link>
      )
    }
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return (
        <Badge variant="secondary">{formatName(row.original.category)}</Badge>
      )
    }
  },
  {
    accessorKey: "series",
    header: "Series",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "orderAmount",
    header: "Order Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("orderAmount") as string);
      return "$ " + amount.toFixed(2); // Format as currency
    },
  },
  {
    accessorKey: "orderStatus",
    header: "Order Status",
    cell: ({ row }) => {
      return (
        <Badge>{formatName(row.original.orderStatus)}</Badge>
      )
    }
  },
  // {
  //   accessorKey: "userId",
  //   header: "User ID",
  // },

  // Add more columns as needed
];

export function OrderTable({ custOrders }: Props) {
  const isMobile = useIsMobile();
  const { open } = useSidebar();
  const [isGrabMode, setIsGrabMode] = useState(false)
  const orderTableContainerRef = React.useRef<HTMLDivElement>(null)

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
  const { containerProps } = useGrabScroll({
    ref: orderTableContainerRef,
    isGrabMode,
  })
  const table = useReactTable({
    data: custOrders?.content || [], // Provide an empty array as fallback
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!custOrders || !custOrders.content || custOrders.content.length === 0) {
    return <div>No orders to display.</div>; // Or some other appropriate message
  }


  const sidebarWidth = 256;
  var containerMaxWidth = '100vw'
  if (!isMobile) {
    containerMaxWidth = open ? `calc(100vw - ${sidebarWidth}px)` : '100vw';
  }
  return (
    <div style={{ maxWidth: containerMaxWidth }}>
      <Card className="m-2">
        <div
          ref={orderTableContainerRef}
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
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
      {/*
      <div className="flex items-center justify-between space-x-2 py-2">
        <div>
          Showing {table.getRowModel().rows.length} of{" "}
          {custOrders?.page.totalElements} results
        </div>
      </div>*/}
    </div>
  );
}
