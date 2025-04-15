import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Routes, Route, Link, useLocation } from "react-router-dom";
import ProductImages from './profile/ProductImages.tsx'
import ProductDetails from './profile/ProductDetails.tsx'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb.tsx";
import ProductList from "./profile/ProductList.tsx";
import { formatName } from "@/components/utils.tsx";
import React from "react";
import ProductUpdate from "./profile/ProductUpdate.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import AccountPage from "./profile/Account.tsx";

const Profile = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen">
          <div className="flex sticky top-0 z-30 items-center p-2 w-full border-b gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4"/>
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
          <Routes>
            <Route path="product_list" element={<ProductList />} />
            <Route path="product_details" element={<ProductDetails />} />
            <Route path="product_images" element={<ProductImages />} />
            <Route path="product_update" element={<ProductUpdate />} />
            <Route path="account" element={<AccountPage />} />
          </Routes>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default Profile;
