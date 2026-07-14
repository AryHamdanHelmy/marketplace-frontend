import React from "react";
import Card from "./Card";
import productivityImage from "../assets/prod.png";
import marketingImage from "../assets/market.png";
import codeImage from "../assets/code.png";
import designImage from "../assets/design.png";
import aiToolsImage from "../assets/ai.png";

const categories = [{
    image: productivityImage,
    title: "Productivity",
    description: "Boost your efficiency with AI-powered productivity tools.",

},
{
    title: "Marketing",
    description: "Enhance your marketing strategies with AI-driven insights.",
    image: marketingImage,
},
{
    title: "Code",
    description: "Accelerate your coding with intelligent AI assistants.",
    image: codeImage,
},
{
    title: "Design",
    description: "Unleash your creativity with AI-enhanced design tools.",
    image: designImage,
},
{
    title: "AI Tools",
    description: "Explore a wide range of innovative AI tools for various applications.",
    image: aiToolsImage,
},
];

export default function Categories() {
    return (
        <div className="px-5 py-5 md md:w-auto md:px-40">
            <h1 className="text-putih text-2xl">
                Categories
            </h1>
            <div className="flex overflow-x-auto gap-4 py-5 scrollbar-hide ">
                {categories.map((cat) => (
                    <div key={cat.title} className="min-w-[160px] flex-srink-0">
                        <Card
                            title={cat.title}
                            description={cat.description}
                            image={cat.image}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}