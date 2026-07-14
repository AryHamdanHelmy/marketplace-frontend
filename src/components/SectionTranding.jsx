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
];

export default function Tranding() {
    return (
        <div className="px-5 py-5 md:w-auto md:px-40">
            <h1 className="text-putih text-2xl">
                Tranding
            </h1>
            <div className="flex overflow-x-auto gap-4 py-5 scrollbar-hide ">
                {TrandingCard.map((cat) => (
                    <div key={cat.title} className="min-w-[160px] flex-shrink-0">
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