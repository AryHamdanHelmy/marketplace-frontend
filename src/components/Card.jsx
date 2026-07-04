import react from "react";

export default function Card({
    image,
    imageBg,
    title,
    description,
    onClick,
}) {
    return (
        <div onClick={onClick}
            className="flex  flex-col gap-3"
        >
            <div className={`${imageBg} rounded-2xl overflow-hidden aspect-square w-full`}>
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <div className="px-1">
                <h3 className="font-bold text-white text-sm md:text-base">{title}</h3>
                <p className="text-xs text-description leading-snug mt-1 md:text-sm">{description}</p>
            </div>

        </div>
    );
}