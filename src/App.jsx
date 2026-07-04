import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/SectionHero";
import Category from "./components/SectionCategory";
import Featured from "./components/SectionFeature";
import FeaturedImage from "./assets/trand.png";
import Tranding from "./components/SectionTranding";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="bg-hitam font-sans">
      <Navbar />
      <Hero />
      <Category />
      <Featured
        image={FeaturedImage}
        title="Top Rated AI Tools"
        description="Revolutionize your workflow with this highly-rated AI tool. Experience unparalleled efficiency and innovation."
      />
      <Tranding />
      <Footer />
    </div>
  )
}
