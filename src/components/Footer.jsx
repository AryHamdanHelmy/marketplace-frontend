import { ShieldCheck, BadgeCheck } from "lucide-react";

export default function Footer() {
    return (
        <footer className="mt-8 text-center">
          <div className="flex items-center justify-center gap-3 text-textMuted">
            <span className="inline-flex items-center gap-1.5 text-xs">
              <ShieldCheck size={13} />
              SSL encrypted
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5 text-xs">
              <BadgeCheck size={13} />
              Verified artisan partners
            </span>
          </div>
          <p className="mb-3 text-xs text-textSecondary">
            Rapaku · Open your shop © {new Date().getFullYear()}
          </p>
        </footer>
    );
}