import React from "react";
import { useState } from "react";
import logoImage from "../assets/logo.png";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="w-full fixed px-5 py-5 bg-hitam/70 border-b border-description shadow-sm top-0 z-50 backdrop-blur-3xl">
            <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-white">DibiTech</div>
                {/* Mobile menu button */}
                <button
                    className="md:hidden flex flex-col gap-1.5 p-1"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                    <span className={`block w-6 h-0.5 bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
                    <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                </button>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <ul className="flex gap-6 text-putih font-medium text-sm">
                        <li className="hover:text-indigo-600 cursor-pointer transition">Explore</li>
                        <li className="hover:text-indigo-600 cursor-pointer transition">Category</li>
                        <li className="hover:text-indigo-600 cursor-pointer transition">Cart</li>
                        <li className="hover:text-indigo-600 cursor-pointer transition">LMS</li>
                    </ul>
                    <button className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition font-medium text-sm">
                        Login
                    </button>
                </nav>
            </div>

            {/* Mobile dropdown menu */}
            {menuOpen && (
                <nav className="md:hidden absolute top-full left-0 w-full bg-hitam/90 backdrop-blur-3xl rounded-b-3xl pb-2 border-t border-gray-100 pt-4 flex flex-col gap-4 items-center">
                    <ul className="flex flex-col gap-3 text-putih text-center font-medium text-sm">
                        <li className="hover:text-indigo-600 cursor-pointer transition">Explore</li>
                        <li className="hover:text-indigo-600 cursor-pointer transition">Category</li>
                        <li className="hover:text-indigo-600 cursor-pointer transition">Cart</li>
                        <li className="hover:text-indigo-600 cursor-pointer transition">LMS</li>
                    </ul>
                    <button className="bg-indigo-600 text-white px-2 py-2 rounded-full hover:bg-indigo-700 transition font-medium text-sm w-20">
                        Login
                    </button>
                </nav>
            )}
        </header>
    );
}

