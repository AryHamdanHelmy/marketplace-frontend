import React from "react";
import backgroundImage from "../assets/hero.png";

export default function Hero() {
    return (
        <section className="bg-hitam px-5 h-125 pt-25 md:pt-25 md:h-145 md:px-40 flex md:justify-center text-center">
            <div style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }} className="w-80 h-100 px-8 py-40 md:w-232 md:h-120 rounded-2xl">
            <h1 className="text-2xl font-extrabold text-putih leading-tight md:text-4xl md:max-w-3xl md:mx-auto">
                Discover the Future of Work with AI
            </h1>
            <p className="mt-4 text-sm text-putih md:mt-6 md:text-md md:max-w-xl md:mx-auto">
                Explore a curated marketplace of AI-powered tools designed to transform
                your workflow and unlock new possibilities.
            </p>
            </div>
        </section>
    );
}