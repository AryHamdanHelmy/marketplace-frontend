import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logoImage from "../assets/logo.png";
import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import { useAuth } from "../context/AuthContext";
import { Search, User } from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "./ui/input-group";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { isLoggedIn, isAdmin, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isMovePage = ["/login", "/register"].includes(location.pathname);
    const isAdminPage = location.pathname.startsWith("/users");

    // Tutup menu mobile tiap kali pindah halaman - mencegah state "kebuka"
    // nyangkut dari halaman sebelumnya (Navbar gak pernah unmount antar-route)
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Jangan render Navbar sama sekali di halaman login/register biar tampilan clean
    if (isMovePage) return null;

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (!trimmed) return;
        navigate(`/explore?search=${encodeURIComponent(trimmed)}`);
        setMenuOpen(false);
    };

    return (
        <header className="w-full fixed px-5 py-3 md:px-25 md:py-2 bg-darkblue/90 border-b border-darkblue top-0 z-50 backdrop-blur-3xl">
            <div className="flex items-center justify-between gap-3">
                <Link 
                    to="/" 
                    onClick={()=> setMenuOpen(false)}
                    className="text-xl font-bold text-white shrink-0">DibiTech</Link>
                {/* Search bar - desktop */}
                <form onSubmit={handleSearchSubmit} className="hidden md:block flex-1 max-w-xs">
                    <InputGroup>
                        <InputGroupInput
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <InputGroupAddon>
                            <button type="submit" aria-label="Search" className="flex items-center">
                                <Search size={16} />
                            </button>
                        </InputGroupAddon>
                    </InputGroup>
                </form>

                {/* Search bar - mobile, inline di row atas antara logo dan hamburger */}
                <form onSubmit={handleSearchSubmit} className="md:hidden flex-1 min-w-0">
                    <InputGroup>
                        <InputGroupInput
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <InputGroupAddon>
                            <button type="submit" aria-label="Search" className="flex items-center">
                                <Search size={16} />
                            </button>
                        </InputGroupAddon>
                    </InputGroup>
                </form>

                {/* Mobile menu button */}
                <button
                    className="md:hidden flex flex-col gap-1.5 p-1 shrink-0"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                    <span className={`block w-6 h-0.5 bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
                    <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                </button>
                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <ul className="flex gap-6 text-white font-medium text-sm ">
                        {!isAdminPage && (
                            <>
                                <li className="hover:text-pastel-blue cursor-pointer transition">Category</li>
                                <li className="hover:text-pastel-blue cursor-pointer transition">Cart</li>
                            </>
                        )}
                        {isAdmin && (
                            <li>
                                <Link
                                    to="/users"
                                    className={`hover:text-pastel-blue cursor-pointer transition ${isAdminPage ? "text-pastel-green font-semibold" : ""
                                        }`}
                                >
                                    Manage Users
                                </Link>
                            </li>
                        )}
                    </ul>
                    {isLoggedIn ? (
                        <div className="relative group">
                            <button
                                type="button"
                                className="text-white text-center px-5 py-2 transition font-medium text-sm hover:scale-105"
                            >
                                Hi, {user.name}
                                <p className="text-white font-extrabold">Account &amp; Logout</p>
                            </button>

                            {/* pt-2 di sini jadi jembatan invisible biar hover gak putus pas kursor pindah dari tombol ke dropdown */}
                            <div className="absolute right-0 top-full pt-2 hidden group-hover:block z-50">
                                <div className="w-80 bg-white text-gray-900 rounded-xl shadow-lg overflow-hidden">
                                    {/* Header: avatar + nama + email + Sign Out */}
                                    <div className="flex items-center justify-between gap-3 bg-sky-50 px-5 py-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 shrink-0">
                                                <User size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <LogoutButton
                                            label="Sign Out"
                                            className="text-sky-600 text-sm font-medium hover:underline shrink-0"
                                        />
                                    </div>

                                    {/* Menu: cuma item yang beneran ada fungsinya di aplikasi ini */}
                                    <div className="px-5 py-4">
                                        <p className="font-bold text-gray-900 mb-2">Your Account</p>
                                        <ul className="flex flex-col gap-2 text-sm text-gray-700">
                                            {isAdmin && (
                                                <li>
                                                    <Link to="/users" className="hover:text-sky-600 transition">
                                                        Manage Users
                                                    </Link>
                                                </li>
                                            )}
                                            <li>
                                                <Link to="/explore" className="hover:text-sky-600 transition">
                                                    Explore Products
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="text-white text-center px-5 py-2 transition font-medium text-sm hover:scale-105">
                            Hallo, sign in <p className="text-white font-extrabold">Account & List</p>
                        </Link>)}
                </nav>
            </div>

            {/* Mobile dropdown menu */}
            {!isMovePage && menuOpen && (
                <nav className="md:hidden absolute top-full right-2 w-50 bg-darkblue/90 backdrop-blur-3xl rounded-xl pb-2 pt-4 mt-2 flex flex-col gap-4 items-center">
                    <ul className="flex flex-col gap-3 text-pastel-green text-center font-medium text-sm">
                        {!isAdminPage && (
                            <>
                                <li className="hover:text-pastel-blue cursor-pointer transition">Category</li>
                                <li className="hover:text-pastel-blue cursor-pointer transition">Cart</li>
                            </>
                        )}
                        {isAdmin && (
                            <li>
                                <Link
                                    to="/users"
                                    onClick={() => setMenuOpen(false)}
                                    className={`hover:text-pastel-blue cursor-pointer transition ${isAdminPage ? "text-pastel-green font-semibold" : ""
                                        }`}
                                >
                                    Manage Users
                                </Link>
                            </li>
                        )}
                        <li>
                            <Link to="/explore"
                                onClick={()=>setMenuOpen(false)}
                                className="hover:text-sky-600 transition">
                                Explore Products
                            </Link>
                        </li>
                    </ul>
                    {isLoggedIn ? (
                        <div className="flex flex-col items-center gap-2 w-full px-4">
                            <p className="text-white text-sm">Hi, {user.name}</p>
                            <LogoutButton onClick={()=>setMenuOpen(false)} className="w-full text-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-pastel-blue hover:bg-pastel-cyan transition" />
                        </div>
                    ) : (
                        <Link to="/login" className="text-white px-5 py-2 text-center transition font-medium text-sm hover:scale-105">
                            Hallo, sign in <p className="text-white font-extrabold">Account & List</p>
                        </Link>)}
                </nav>
            )}
        </header>
    );
}