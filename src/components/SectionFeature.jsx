import React from "react";

export default function Featured({ image, title, description }) {
    return (
        <div className="px-5 py-5 md:px-40">
            <h1 className="text-darkblue text-2xl font-bold mb-4">Featured</h1>
            <div className="flex gap-4 items-center">
                <div className="w-40 h-50 md:w-100 rounded-2xl overflow-hidden aspect-square">
                    <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="flex-3 flex flex-col">
                    <h2 className="text-white text-lg font-bold leading-snug">{title}</h2>
                    <p className="text-description py-2 text-sm md:text-lg leading-relaxed">{description}</p>
                    <button className="bg-pastel-blue text-white text-sm font-semibold py-3 rounded-full hover:bg-pastel-cyan transition">
                        Learn More
                    </button>
                </div>

            </div>
        </div>
    );
}