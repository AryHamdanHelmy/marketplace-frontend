export default function Footer() {
    return (
        <footer className="px-5 py-10 text-center">
            <div className="grid grid-cols-2 gap-y-2 gap-x-10 w-fit mx-auto mb-8 md:flex md:gap-8 md:w-auto md:justify-center">
                <span className="text-label hover:text-primaryDark cursor-pointer transition">About Us</span>
                <span className="text-label hover:text-primaryDark cursor-pointer transition">Contact</span>
                <span className="text-label hover:text-primaryDark cursor-pointer transition">Terms of Service</span>
                <span className="text-label hover:text-primaryDark cursor-pointer transition">Privacy Policy</span>
            </div>
            <p className="text-label text-textPrimary">© 2026 Rapaku. All rights reserved.</p>
        </footer>
    );
}