import React from "react";
import backgroundImage from "../assets/benner.png";

export default function Hero() {
    return (
        <section className="pt-24 md:pt-30 px-5 md:px-8 pb-5">

            {/* Main hero + side banners grid — referensi Lumina */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                {/* Main hero banner */}
                <div
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                    className="md:col-span-2 relative h-[260px] md:h-[380px] rounded-2xl overflow-hidden flex items-center"
                >
                    {/* Content */}
                    <div className="flex mb-35  md:px-12 max-w-xl">
                        <button className="bg-pastel-blue/70 hover:bg-pastel-cyan text-white font-semibold px-3 py-1 rounded-full text-sm transition shadow-lg">
                            Pre Order Now
                        </button>
                    </div>
                </div>

                {/* Side banners — desktop only */}
                <div className="hidden md:flex flex-col gap-3">
                    <div className="flex-1 rounded-2xl bg-gray-100 overflow-hidden relative group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                        <div className="absolute bottom-0 left-0 z-20 p-4">
                            <p className="text-white font-bold text-sm">AI Productivity</p>
                            <p className="text-white/70 text-xs mt-0.5">Boost your workflow</p>
                        </div>
                        <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-600 group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 rounded-2xl bg-gray-100 overflow-hidden relative group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                        <div className="absolute bottom-0 left-0 z-20 p-4">
                            <p className="text-white font-bold text-sm">AI Design Tools</p>
                            <p className="text-white/70 text-xs mt-0.5">Create stunning visuals</p>
                        </div>
                        <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-600 group-hover:scale-105 transition-transform duration-300" />
                    </div>
                </div>
            </div>
        </section>
    );
}