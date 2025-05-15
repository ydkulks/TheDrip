import { Search, Shirt, Trash, LogOut, BadgeCheck, ShoppingCart, Star, Book, ChartColumn, User, Lock } from "lucide-react"
import { Link } from 'react-router-dom'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useTokenDetails } from "./utils";
import { NavUser } from "./nav-user";

const administration = [
  // Note: Future enhancement?
  // {
  //   title: "Dashboard",
  //   url: "/profile/dashboard",
  //   icon: ChartColumn,
  // },
  {
    title: "Products",
    url: "/profile/product_list",
    icon: Shirt,
  },
  {
    title: "User Management",
    url: "/profile/user_management",
    icon: User,
  },
]

const product = [
  {
    title: "Dashboard",
    url: "/profile/dashboard",
    icon: ChartColumn,
  },
  {
    title: "Products",
    url: "/profile/product_list",
    icon: Shirt,
  },
]

const customer = [
  {
    title: "Cart",
    url: "/cart",
    icon: ShoppingCart,
  },
  {
    title: "Reviews",
    url: "/profile/reviews",
    icon: Star,
  },
  {
    title: "Orders",
    url: "/profile/orders",
    icon: Book,
  },
]

const account = [
  {
    title: "Account",
    url: "/profile/account",
    icon: BadgeCheck,
  },
  {
    title: "Logout",
    url: "/profile/account",
    icon: LogOut,
  },
  {
    title: "Password Reset",
    url: "/profile/account",
    icon: Lock,
  },
  {
    title: "Delete Account",
    url: "/profile/account",
    icon: Trash,
  },
]

function triggerCommandPalette() {
  const event = new KeyboardEvent('keydown', {
    ctrlKey: true,
    key: 'p',
    code: 'KeyP',
    charCode: 112,
    keyCode: 80,
    which: 80,
  });

  document.dispatchEvent(event);
}
interface user {
  name: string
  role: string
  email: string
  avatar: string
}

const AppSidebar = () => {
const { decodedToken } = useTokenDetails();
const userData: user = {
  name: decodedToken.sub,
  role: decodedToken.role,
  email: decodedToken.email,
  avatar: 'https://github.com/shadcn.png',
};
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex justify-between items-center">
          <h2 className="font-integralcf font-extrabold text-md">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Link to="/">
                    THE DRIP.
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Home</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  onClick={triggerCommandPalette}
                  variant="ghost"
                  className="inline-flex justify-between rounded-lg text-gray-500 hover:text-gray-500">
                  <div className="flex">
                    <Search />{/*<span className="pl-2">Search...</span>*/}
                  </div>
                  {/*<code className="bg-gray-200 text-gray-500 border px-1 rounded-md">⌘ P</code>*/}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Command Palette</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {decodedToken.role === "Admin" ?
          <><SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {administration.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
            <SidebarSeparator /></>
          : null}
        {decodedToken.role === "Seller" ?
          <><SidebarGroup>
            <SidebarGroupLabel>My Product</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {product.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
            <SidebarSeparator /></>
          : null}
        {decodedToken.role === "Customer" ?
          <><SidebarGroup>
            <SidebarGroupLabel>Customer</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {customer.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
            <SidebarSeparator /></>
          : null}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {account.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}

export { AppSidebar };
