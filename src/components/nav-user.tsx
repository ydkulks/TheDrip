import {
  BadgeCheck,
  Book,
  ChevronsUpDown,
  LogOut,
  Shirt,
  ShoppingCart,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { useIsMobile } from "@/components/hooks/use-mobile"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "./ui/alert-dialog"
import { useTokenDetails } from "./utils"

export function NavUser({
  user,
}: {
  user: {
    name: string
    role: string
    email: string
    avatar: string
  }
}) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(true);
  }
  const confirmLogout = async () => {
    setOpen(false); // Close pop-up

    // 1. Clear the JWT from client-side storage
    localStorage.removeItem("token"); // Or sessionStorage, cookie, etc.

    // 2. Optionally notify the backend
    // try {
    //   const response = await fetch("/api/logout", {
    //     method: "POST", // Or DELETE, depending on your API
    //     headers: {
    //       "Content-Type": "application/json"
    //       // Include any necessary authorization headers if required
    //     }
    //   });

    //   if (!response.ok) {
    //     console.error("Logout failed on the server:", response.status);
    //     // Handle server-side logout failure (e.g., display an error message)
    //   }
    // } catch (error) {
    //   console.error("Error during logout:", error);
    //   // Handle network errors or other issues
    // }

    // 3. Redirect to the login page
    navigate("/login");
  };
  const { decodedToken } = useTokenDetails();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{user.name ? user.name.slice(0, 2) : null}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.role}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{user.name ? user.name.slice(0, 2) : null}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate("/profile/account")}>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                {decodedToken.role === "Customer" && (
                  <DropdownMenuItem onClick={() => navigate("/cart")}>
                    <ShoppingCart />
                    Cart
                  </DropdownMenuItem>
                )}
                {decodedToken.role === "Customer" && (
                  <DropdownMenuItem onClick={() => navigate("/profile/orders")}>
                    <Book />
                    Orders
                  </DropdownMenuItem>
                )}
                {decodedToken.role === "Seller" && (
                  <DropdownMenuItem onClick={() => navigate("/profile/product_list")}>
                    <Shirt />
                    Products
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will log you out of the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>Log Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function SheetNavUser({
  user,
}: {
  user: {
    name: string
    role: string
    email: string
    avatar: string
  }
}) {
  // const isMobile = useIsMobile();
  const isMobile = true;
  const navigate = useNavigate()
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(true);
  }
  const confirmLogout = async () => {
    setOpen(false); // Close pop-up

    // 1. Clear the JWT from client-side storage
    localStorage.removeItem("token"); // Or sessionStorage, cookie, etc.

    // 3. Redirect to the login page
    navigate("/login");
  };
  return (
    <div className="">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="lg"
            className="w-full justify-start gap-2 px-2 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">{user.name ? user.name.slice(0, 2) : null}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs">{user.role}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{user.name ? user.name.slice(0, 2) : null}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => navigate("/profile/account")}>
              <BadgeCheck className="mr-2 h-4 w-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { }}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/profile/orders")}>
              <Book className="mr-2 h-4 w-4" />
              Orders
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will log you out of the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>Log Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
