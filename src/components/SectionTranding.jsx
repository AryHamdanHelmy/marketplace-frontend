import react from "react";
import Card from "./Card";
import trandingWriting from "../assets/ftr1.png";
import trandingImage from "../assets/ftr2.png";
import trandingData from "../assets/ftr3.png";
import trandingCustomerService from "../assets/ftr4.png";

const TrandingCard = [{
    image: trandingWriting,
    title: "AI Writing Assistant",
    description: "Generate high-quality content effortlessly with this AI writing assistant.",
},
{
    title: "AI Image Generator",
    description: "Create stunning visuals with the power of AI image generation.",
    image: trandingImage,
},
{
    title: "AI Data Analysis Tool",
    description: "Analyze complex data sets and gain valuable insights with this AI tool.",
    image: trandingData,
},
{
    title: "AI Customer Support",
    description: "Enhance your customer service with AI-powered support solutions.",
    image: trandingCustomerService,
},
{
    title: "AI Customer Support",
    description: "Enhance your customer service with AI-powered support solutions.",
    image: trandingCustomerService,
},
];

export default function Tranding() {
    return (
        <div className="px-5 py-5 md:px-8">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-darkblue uppercase tracking-wide">
                        Tranding
                    </h2>
                </div>

                {/* Desktop: grid, Mobile: horizontal scroll */}
                <div className="flex overflow-x-auto scrollbar-hide md:grid grid-cols-5">
                    {TrandingCard.map((cat, index) => (
                        <button
                            key={index}
                            className="flex flex-col items-center gap-3 p-3 hover:bg-pastel-blue/40 rounded-lg transition cursor-pointer group"
                        >
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
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
            </div>
        </div>
    );
}