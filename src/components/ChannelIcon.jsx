import { useState } from "react";
import { Landmark, QrCode, Wallet, Smartphone } from "lucide-react";

// Keys must match the channel codes the backend's charge builder accepts.
export const METHOD_FOR_CHANNEL = {
    qris: "ewallet",
    gopay: "ewallet",
    ovo: "ewallet",
    bca_va: "bank_transfer",
    bni_va: "bank_transfer",
    bri_va: "bank_transfer",
    permata_va: "bank_transfer",
};  

const CHANNEL_ICON = {
    qris: QrCode,
    gopay: Wallet,
    ovo: Smartphone,
    bca_va: Landmark,
    bni_va: Landmark,
    bri_va: Landmark,
    permata_va: Landmark,
};

const CHANNEL_LOGO = {
    qris: "/payment/Qris.svg",
    gopay: "/payment/Gopay.svg",
    ovo: "/payment/Ovo.svg",
    bca_va: "/payment/BCA.svg",
    bni_va: "/payment/BNI.svg",
    bri_va: "/payment/BRI.svg",
    permata_va: "/payment/Permata.svg"

};

export default function ChannelIcon({code, logo, active}) {
    const [broken, setBroken] = useState(false);
    const src = logo || CHANNEL_LOGO[code];

    if (src && !broken) {
        return (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center">
                <img
                    src={src}
                    alt=""
                    onError={() => setBroken(true)}
                    className="max-h-full max-w-full object-contain"
                />
            </span>
        );
    }

    const Icon = CHANNEL_ICON[code] || Landmark;
    return (
        <span
            className={`flex h-9 w-12 shrink-0 items-center justify-center rounded-lg ${
                active ? "bg-primary text-white" : "bg-ink-100 text-textSecondary"
            }`}
        >
            <Icon size={16} />
        </span>
    );
}