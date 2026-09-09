import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { SellerNavProvider } from "./context/SellerNavContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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
import ShopSettings from "./pages/ShopSettings";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import SellerBalance from "./pages/SellerBalance";
import Home from "./pages/Home";

// The storefront shell. Auth pages deliberately sit outside this so the
// navbar, search, and cart don't appear while someone is signing in.
function MainLayout() {
  return (
    <div className="bg-background font-sans pb-16 md:pb-0">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <SellerNavProvider>
      <Routes>
        {/* Auth — no chrome */}
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Storefront */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/success/:groupId"
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />

          {/* Seller */}
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/store"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <ShopSettings />
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
          />
          <Route
            path="/seller/products/import"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <ProductImport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["seller", "admin"]}>
                <EditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/balance"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerBalance />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/withdrawals"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminWithdrawals />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </SellerNavProvider>
  );
}