import useMediaQuery from "../hooks/useMediaQuery";
import useNavbarState from "./navbar/useNavbarState";
import NavbarDesktop from "./navbar/NavbarDesktop";
import NavbarMobile from "./navbar/NavbarMobile";

export default function Navbar() {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const nav = useNavbarState();

    if (nav.isHidden) return null;

    return isDesktop ? <NavbarDesktop {...nav} /> : <NavbarMobile {...nav} />;
}