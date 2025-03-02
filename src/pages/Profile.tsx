import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Routes, Route, Link } from "react-router-dom";
import ProductImages from './profile/ProductImages.tsx'
import ProductDetails from './profile/ProductDetails.tsx'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb.tsx";

const Profile = () => {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <div className="flex sticky top-0">
            <SidebarTrigger />
            <Breadcrumb className="m-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Link to="/"><BreadcrumbLink>Home</BreadcrumbLink></Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <Link to="/profile"><BreadcrumbLink>Profile</BreadcrumbLink></Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <Link to="/profile/productdetails"><BreadcrumbPage>Create product</BreadcrumbPage></Link>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Routes>
            <Route path="productdetails" element={<ProductDetails />} />
            <Route path="productimages" element={<ProductImages />} />
          </Routes>
        </main>
      </SidebarProvider>
    </>
  );
};

export default Profile;
