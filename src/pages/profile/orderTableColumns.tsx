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
  },
  {
    accessorKey: "category",
    header: "Category",
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
      return amount.toFixed(2); // Format as currency
    },
  },
  {
    accessorKey: "orderStatus",
    header: "Order Status",
  },
  {
    accessorKey: "userId",
    header: "User ID",
  },

  // Add more columns as needed
];

export function OrderTable({ custOrders }: Props) {
  const table = useReactTable({
    data: custOrders?.content || [], // Provide an empty array as fallback
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!custOrders || !custOrders.content || custOrders.content.length === 0) {
    return <div>No orders to display.</div>; // Or some other appropriate message
  }

  return (
    <div className="w-full">
      <div className="rounded-md border">
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
      <div className="flex items-center justify-between space-x-2 py-2">
        <div>
          Showing {table.getRowModel().rows.length} of{" "}
          {custOrders?.page.totalElements} results
        </div>
      </div>
    </div>
  );
}
