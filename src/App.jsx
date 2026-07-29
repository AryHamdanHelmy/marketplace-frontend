import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Hero from "./components/SectionHero";
import Category from "./components/SectionCategory";
import Featured from "./components/SectionFeature";
import FeaturedImage from "./assets/trand.png";
import Tranding from "./components/SectionTranding";
import Footer from "./components/Footer";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import Explore from "./pages/Explore";
import Cart from "./pages/Cart";
import SellerDashboard from "./pages/SellerDashboard";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import AdminCategories from "./pages/AdminCategories";
import AdminProducts from "./pages/AdminProducts";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import SellerOrders from "./pages/SellerOrders";
import ProductImport from "./pages/ProductImport";

function Home() {
  return (
    <>
      <Hero />
      <Category />
      <Featured
        image={FeaturedImage}
        title="Top Rated AI Tools"
        description="Revolutionize your workflow with this highly-rated AI tool. Experience unparalleled efficiency and innovation."
      />
      <Tranding />
    </>
  );
}

export default function App() {
  return (
    <div className="bg-white font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]} >
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
          <ProtectedRoute>
            <Cart/>
          </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
          <ProtectedRoute>
            <Checkout/>
          </ProtectedRoute>
          }
        />
        <Route
          path="/orders/success/:groupId"
          element={
          <ProtectedRoute>
            <OrderSuccess/>
          </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
          <ProtectedRoute>
            <MyOrders/>
          </ProtectedRoute>
          }
        />
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["seller","admin"]}>
              <EditProduct/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products/new"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <AddProduct />
            </ProtectedRoute>
          }
        /><Route
          path="/seller/orders"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories" 
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCategories />
            </ProtectedRoute>} 
        />
        <Route
          path="/admin/products" 
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProducts/>
            </ProtectedRoute>} 
        />
        <Route
          path="/seller/products/import" 
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ProductImport/>
            </ProtectedRoute>} 
        />
        <Route path="/explore" element={<Explore/>}/>
        <Route
          path="/users/:id" 
          element={<UserDetails />} 
        />
        <Route path="/explore" element={<Explore/>}/>
      </Routes>
      <Footer />
    </div>
  );
}