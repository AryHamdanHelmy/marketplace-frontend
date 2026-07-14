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
import Login from "./pages/Login";
import Register from "./pages/Register";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";

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
    <div className="bg-hitam font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["seller"]} >
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id" 
          element={<UserDetails />} />
      </Routes>
      <Footer />
    </div>
  );
}