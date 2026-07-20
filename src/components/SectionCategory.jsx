import React from "react";
import computerImage from "../assets/computer.png";
import foodImage from "../assets/F&b.png";
import fasionAccImage from "../assets/fasionacc.png";
import electronicImage from "../assets/electronic.png";
import menFashionImage from "../assets/Menfashion.png";
import womenFashionImage from "../assets/Womenfashion.png";
import footwearImage from "../assets/Footwear.png";
import kitchenImage from "../assets/Kitchen.png";
import otomotifImage from "../assets/Otomotif.png";
import handphoneAccImage from "../assets/Handphone&acc.png";

const categories = [
    {
        image: computerImage,
        title: "Computer & Accesories",
        description: "Boost your efficiency with AI-powered productivity tools.",
        icon: "⚡",
    },
    {
        title: "Electronic",
        description: "Enhance your marketing strategies with AI-driven insights.",
        image: electronicImage,
        icon: "📣",
    },
    {
        title: "Men fashion",
        description: "Accelerate your coding with intelligent AI assistants.",
        image: menFashionImage,
        icon: "💻",
    },
    {
        title: "Women fashion",
        description: "Unleash your creativity with AI-enhanced design tools.",
        image: womenFashionImage,
        icon: "🎨",
    },
    {
        title: "Footwear",
        description: "Explore a wide range of innovative AI tools for various applications.",
        image: footwearImage,
        icon: "🤖",
    },
    {
        title: "Otomotif",
        description: "Explore a wide range of innovative AI tools for various applications.",
        image: otomotifImage,
        icon: "🤖",
    },
    {
        title: "Handphond & accesories",
        description: "Explore a wide range of innovative AI tools for various applications.",
        image: handphoneAccImage,
        icon: "🤖",
    },
    {
        title: "Kitchen",
        description: "Explore a wide range of innovative AI tools for various applications.",
        image: kitchenImage,
        icon: "🤖",
    },
    {
        title: "Food & baverage",
        description: "Explore a wide range of innovative AI tools for various applications.",
        image: foodImage,
        icon: "🤖",
    },
    {
        title: "Accecories fashion",
        description: "Explore a wide range of innovative AI tools for various applications.",
        image: fasionAccImage,
        icon: "🤖",
    },


];

export default function Categories() {
    return (
        <div className="px-5 py-5 md:px-8">

            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Popular Categories
                    </h2>
                </div>

                {/* Desktop: grid, Mobile: horizontal scroll */}
                <div className="hidden md:grid grid-cols-5">
                    {categories.map((cat) => (
                        <button
                            key={cat.title}
                            className="flex flex-col items-center gap-3 p-3 hover:bg-pastel-blue/40 rounded-lg transition cursor-pointer group"
                        >
                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                                {cat.image ? (
                                    <img
                                        src={cat.image}
                                        alt={cat.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                ) : (
                                    <span className="text-2xl">{cat.icon}</span>
                                )}
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-semibold text-darkblue">{cat.title}</p>
                                <p className="text-[10px] text-gray-600 hover:text-darkblue mt-0.5 leading-snug line-clamp-2">{cat.description}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Mobile: horizontal scroll */}
                <div className="md:hidden flex overflow-x-auto scrollbar-hide gap-1 p-3">
                    {categories.map((cat) => (
                        <button
                            key={cat.title}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer shrink-0 min-w-[80px]"
                        >
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                                {cat.image ? (
                                    <img
                                        src={cat.image}
                                        alt={cat.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xl">{cat.icon}</span>
                                )}
                            </div>
                            <p className="text-[10px] font-semibold text-darkblue text-center leading-tight">{cat.title}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}