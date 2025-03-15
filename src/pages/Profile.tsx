import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Routes, Route, Link, useLocation } from "react-router-dom";
import ProductImages from './profile/ProductImages.tsx'
import ProductDetails from './profile/ProductDetails.tsx'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb.tsx";
import ProductList from "./profile/ProductList.tsx";
import { formatName } from "@/components/utils.tsx";
import React from "react";

const Profile = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full overflow-hidden">
          <div className="flex sticky top-0 z-30">
            <SidebarTrigger />
            <Breadcrumb className="m-2 p-2 rounded-md bg-white">
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
          <Routes>
            <Route path="product_list" element={<ProductList />} />
            <Route path="product_details" element={<ProductDetails />} />
            <Route path="product_images" element={<ProductImages />} />
          </Routes>
        </main>
      </SidebarProvider>
    </>
  );
};

export default Profile;
