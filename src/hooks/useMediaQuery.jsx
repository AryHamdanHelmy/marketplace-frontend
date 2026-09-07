import { useState, useEffect } from "react";

export default function useMediaQuery(query) {
    // Init sinkron -> render pertama udah bener, nggak ada flash
    const [matches, setMatches] = useState(
        () => window.matchMedia(query).matches
    );

    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = (e) => setMatches(e.matches);

        setMatches(mql.matches); // jaga-jaga kalau query berubah
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, [query]);

    return matches;
}