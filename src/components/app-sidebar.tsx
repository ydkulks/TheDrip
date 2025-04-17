import { Search, Shirt, Trash, LayoutDashboard, LogOut, BadgeCheck } from "lucide-react"
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
import { tokenDetails } from "./utils";
import { NavUser } from "./nav-user";

const product = [
  {
    title: "Dashboard",
    url: "/profile",
    icon: LayoutDashboard,
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
    icon: BadgeCheck,
  },
  {
    title: "Reviews",
    url: "/profile/reviews",
    icon: BadgeCheck,
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
    title: "Delete Account",
    url: "/profile/account#delete_account",
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
const userData: user = {
  name: tokenDetails().sub,
  role: tokenDetails().role,
  email: tokenDetails().email,
  avatar: 'https://github.com/shadcn.png',
};

const AppSidebar = () => {
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
        {tokenDetails().role === "Seller" || tokenDetails().role === "Admin" ?
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
        {tokenDetails().role === "Customer" ?
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
