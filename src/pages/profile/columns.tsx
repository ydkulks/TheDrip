// columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/components/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Check, ChevronDown, Pencil, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { formatSize } from "@/components/utils";

function formatName(name: string) {
  return name.replace(/_/g, ' ') // Replace underscores with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' ');
}
function ImageModal({ images }: { images: string[] }) {
  // console.log(images.map((image, index) => {return {image, index}}))
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Images</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Product Images</DialogTitle>
          <DialogDescription>All images of the product</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Product Image ${index + 1}`}
              className="rounded-md"
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   accessorKey: "productId",
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       >
  //         ID
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     );
  //   },
  // },
  {
    accessorKey: "productName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "productDescription",
    header: "Description",
    cell: ({ row, table }) => {
      const { editingId, editedValues, handleChange }: any = table.options.meta;
      return editingId === row.original.productId ? (
        <Textarea
          rows={6}
          value={editedValues.productDescription || ""}
          onChange={(e) => handleChange("productDescription", e.target.value)}
        />
      ) : (
        <pre>{row.original.productDescription}</pre>
      );
    },
  },
  {
    accessorKey: "productPrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row, table }) => {
      const amount = parseFloat(row.getValue("productPrice"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      const { editingId, editedValues, handleChange }: any = table.options.meta;
      return editingId === row.original.productId ? (
        <Input
          type="number"
          value={editedValues.productPrice || ""}
          onChange={(e) => handleChange("productPrice", Number(e.target.value))}
        />
      ) : (
        <div className="text-right font-medium">{formatted}</div>
      )
    },
  },
  {
    accessorKey: "productStock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row, table }) => {
      const { editingId, editedValues, handleChange }: any = table.options.meta;
      return editingId === row.original.productId ? (
        <Input
          type="number"
          value={editedValues.productStock || ""}
          onChange={(e) => handleChange("productStock", Number(e.target.value))}
        />
      ) : (
        row.original.productStock
      );
    },
  },
  {
    accessorKey: "seriesName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Series
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "categoryName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return formatName(row.original.categoryName);
    },
  },
  {
    accessorKey: "sellerName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Seller
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "colors",
    header: "Colors",
    cell: ({ row, table }) => {
      const { editingId, editedValues, handleChange }: any = table.options.meta;
      return editingId === row.original.productId ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto m-2">
              Select Colors<ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {["original", "black", "white"].map((color) => (
              <DropdownMenuCheckboxItem
                key={color}
                checked={editedValues.colors.includes(color)}
                onCheckedChange={() => handleChange("colors", color)}
              >
                {formatName(color)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex flex-wrap gap-1">
          {row.original.colors.length > 0 ? (
            row.original.colors.map((color) => (
              <Badge variant="outline" key={color}>{formatName(color)}</Badge>
            ))
          ) : (
            <span>No colors</span>
          )}
        </div>
      )
    },
  },
  {
    id: "sizes",
    header: "Sizes",
    cell: ({ row, table }) => {
      const { editingId, editedValues, handleChange }: any = table.options.meta;
      return editingId === row.original.productId ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto m-2">
              Select Sizes<ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {["small", "medium", "large", "extra_large", "double_extra_large"].map((size) => (
              <DropdownMenuCheckboxItem
                key={size}
                checked={editedValues.sizes.includes(size)}
                onCheckedChange={() => handleChange("sizes", size)}
              >
                {formatSize(size)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex flex-wrap gap-1">
          {row.original.sizes.length > 0 ? (row.original.sizes.map((size) => (
            <Badge variant="outline" key={size}>{formatSize(size)}</Badge>
          ))
          ) : (
            <span>No Sizes</span>
          )
          }
        </div >
      )
    },
  },
  {
    id: "images",
    header: "Images",
    cell: ({ row }) => <ImageModal images={row.original.images} />,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const { editingId, handleEdit, handleSave, handleCancel }: any = table.options.meta;
      return editingId === row.original.productId ? (
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm" variant="default">
            <Check className="h-4 w-4" />
          </Button>
          <Button onClick={handleCancel} size="sm" variant="outline">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button onClick={() => handleEdit(row.original)} size="sm" variant="ghost">
          <Pencil className="h-4 w-4" />
        </Button>
      );
    },
  },
];
