import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Routes, Route, Link, useLocation } from "react-router-dom";
import ProductImages from './profile/ProductImages.tsx'
import ProductDetails from './profile/ProductDetails.tsx'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb.tsx";
import ProductList from "./profile/ProductList.tsx";
import { formatName, useTokenDetails } from "@/components/utils.tsx";
import React from "react";
import ProductUpdate from "./profile/ProductUpdate.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import AccountPage from "./profile/Account.tsx";
import Reviews from "./profile/Reviews.tsx";
import Orders from "./profile/Orders.tsx";
import { Command, Github, LucideMousePointerClick, Mouse, Space } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import Dashboard from "./profile/Dashboard.tsx";

const Profile = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const { decodedToken } = useTokenDetails();
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen">
          <div className="flex sticky top-0 z-30 items-center p-2 w-full border-b gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Link to="/">
                    <BreadcrumbLink>Home</BreadcrumbLink>
                  </Link>
                </BreadcrumbItem>

                {pathSegments.map((segment, index) => {
                  const path = `/${pathSegments.slice(0, index + 1).join("/")}`; // Construct full path
                  const formattedSegment = formatName(segment); // Apply formatting

                  return (
                    <React.Fragment key={path}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <Link to={path}>
                          <BreadcrumbLink>{formattedSegment}</BreadcrumbLink>
                        </Link>
                      </BreadcrumbItem>
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Welcome Page */}
            {location.pathname === "/profile" && (
              <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto p-6 text-center">
                {/* Logo */}
                <h1 className="font-integralcf font-extrabold mt-5 text-5xl text-center text-gray-300 md:text-7xl">TheDrip.</h1>
                {/* Help */}
                <div className="text-sm text-muted-foreground mt-7">
                  <div className="flex justify-between gap-5 m-2">
                    <span>Command Pallet</span>
                    <span>
                      <Badge variant="secondary" className="text-muted-foreground py-1"><Command size="12" /></Badge>
                      +
                      <Badge variant="secondary" className="text-muted-foreground">P</Badge>
                    </span>
                  </div>
                  <div className="flex justify-between gap-5 m-2">
                    <span>Toggle Side Bar</span>
                    <span>
                      <Badge variant="secondary" className="text-muted-foreground py-1"><Command size="12" /></Badge>
                      +
                      <Badge variant="secondary" className="text-muted-foreground">B</Badge>
                    </span>
                  </div>
                  <div className="flex justify-between gap-5 m-2">
                    <span>Pan Table (Horizontal)</span>
                    <span>
                      <Badge variant="secondary" className="text-muted-foreground py-1"><Space size="13" /></Badge>
                      +
                      <Badge variant="secondary" className="text-muted-foreground py-1 gap-1">Left <LucideMousePointerClick size="16" /></Badge>
                      +
                      <Badge variant="secondary" className="text-muted-foreground gap-1">Drag <Mouse size="13" /></Badge>
                    </span>
                  </div>
                  {decodedToken.role === "Seller" && (
                    <div className="flex justify-between gap-5 m-2">
                      <span>Table Context Menu</span>
                      <span>
                        <Badge
                          variant="secondary"
                          className="text-muted-foreground py-1 gap-1">
                          Right <LucideMousePointerClick size="16" />
                        </Badge>
                      </span>
                    </div>
                  )}
                </div>
                {/* Footer Text */}
                <div className="text-sm text-muted-foreground mt-auto flex flex-col items-center gap-2">
                  <p>TheDrip v1.0.0</p>
                  <div className="flex items-center gap-4">
                    <Link
                      to="https://github.com/ydkulks/TheDrip"
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      <span>GitHub</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="product_list" element={<ProductList />} />
              <Route path="product_list/product_details" element={<ProductDetails />} />
              <Route path="product_list/product_images" element={<ProductImages />} />
              <Route path="product_list/product_update" element={<ProductUpdate />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="orders" element={<Orders />} />
            </Routes>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default Profile;
