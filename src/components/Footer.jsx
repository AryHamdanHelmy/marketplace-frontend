import React from "react";
import iconInstagram from "../assets/Instagram.png";
import iconWhatsapp from "../assets/Whatsaapp.png";
import iconFacebook from "../assets/Facebook.png";

export default function Footer() {
    return (
        <footer className="px-5 py-10 text-center">
            <div className="grid grid-cols-2 gap-x-20 gap-y-4 w-fit mx-auto mb-8 md:flex md:gap-16 md:w-auto md:justify-center">
                <span className="text-description hover:text-white cursor-pointer transition text-sm">About Us</span>
                <span className="text-description hover:text-white cursor-pointer transition text-sm">Contact</span>
                <span className="text-description hover:text-white cursor-pointer transition text-sm">Terms of Service</span>
                <span className="text-description hover:text-white cursor-pointer transition text-sm">Privacy Policy</span>
            </div>
            <div className="flex justify-center gap-5 mb-6">
                <a href="#"><img src={iconInstagram} alt="Instagram" className="w-6 h-6 opacity-60 hover:opacity-100 transition" /></a>
                <a href="#"><img src={iconWhatsapp} alt="WhatsApp" className="w-6 h-6 opacity-60 hover:opacity-100 transition" /></a>
                <a href="#"><img src={iconFacebook} alt="Facebook" className="w-6 h-6 opacity-60 hover:opacity-100 transition" /></a>
            </div>
            <p className="text-description text-xs">© 2026 DibiTech. All rights reserved.</p>
        </footer>
    );
}