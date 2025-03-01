import { Search, Shirt, Images, Trash, UserCircle } from "lucide-react"
import { Link } from 'react-router-dom'
import React from 'react';

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
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem("token");
interface tokenType {
  email: string;
  exp: number;
  iat: number;
  id: number;
  role: string;
  sub: string;
}
let decodedToken: tokenType;
if (token != null) {
  decodedToken = jwtDecode(token);
}
const product = [
  {
    title: "List product",
    url: "/profile",
    icon: Shirt,
  },
  {
    title: "Create product",
    url: "/profile/productdetails",
    icon: Shirt,
  },
  {
    title: "Upload Images",
    url: "/profile/productimages",
    icon: Images,
  },
  {
    title: "Update product",
    url: "/profile",
    icon: Shirt,
  },
  {
    title: "Update Images",
    url: "/profile",
    icon: Images,
  },
  {
    title: "Delete Product",
    url: "/profile",
    icon: Trash,
  },
  {
    title: "Delete Images",
    url: "/profile",
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

const AppSidebar = React.memo(() => {
  return (
    <Sidebar>
      <SidebarHeader>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                onClick={triggerCommandPalette}
                variant="outline"
                className="inline-flex justify-between w-[90%] rounded-lg m-2 text-gray-500 hover:text-gray-500">
                <div className="flex">
                  <Search /><span className="pl-2">Search...</span>
                </div>
                <code className="bg-gray-200 text-gray-500 border px-1 rounded-md">⌘ P</code>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Command Palette</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>My Product</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {product.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <SidebarMenuButton asChild>
                          <Link to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton className="flex">
          <UserCircle />{decodedToken.sub + " "}|{" " + decodedToken.role}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
})

export { AppSidebar };
