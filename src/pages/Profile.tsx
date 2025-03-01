import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Routes, Route } from "react-router-dom";
import ProductImages from './profile/ProductImages.tsx'
import ProductDetails from './profile/ProductDetails.tsx'

const Profile = () => {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <SidebarTrigger />
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
