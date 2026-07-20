import React from "react";

export default function Featured({ image, title, description }) {
    return (
        <div className="px-5 py-5 md:px-8">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

                {/* Header label */}
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Featured Product
                    </h2>
                </div>

                {/* Content */}
                <div className="flex flex-col md:flex-row gap-0">

                    {/* Image */}
                    <div className="w-full md:w-72 h-52 md:h-auto shrink-0 overflow-hidden">
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-center gap-3 px-6 py-5 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-pastel-blue">
                            Top Rated
                        </span>
                        <h3 className="text-lg font-bold text-darkblue leading-snug md:text-2xl">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed md:text-base">
                            {description}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                            <button className="bg-pastel-blue hover:bg-pastel-cyan text-white text-sm font-semibold px-6 py-2.5 rounded-full transition shadow-sm">
                                Learn More
                            </button>
                            <button className="text-sm text-gray-400 hover:text-darkblue font-medium transition">
                                Add to Cart →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}