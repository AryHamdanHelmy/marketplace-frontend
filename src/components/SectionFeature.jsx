import React from "react";

export default function Featured({ image, title, description }) {
    return (
        <div className="px-5 py-5 md:px-40">
            <h1 className="text-putih text-2xl mb-4">Featured</h1>
            <div className="flex gap-4 items-center">
                <div className="w-40 h-60 md:w-100 rounded-2xl overflow-hidden aspect-square">
                    <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="flex-3 flex flex-col">
                    <h2 className="text-putih text-lg font-bold leading-snug">{title}</h2>
                    <p className="text-description py-2 text-sm leading-relaxed">{description}</p>
                    <button className="bg-blue-600 text-white text-sm font-semibold py-3 rounded-full hover:bg-blue-700 transition">
                        Learn More
                    </button>
                </div>

            </div>
        </div>
    );
}