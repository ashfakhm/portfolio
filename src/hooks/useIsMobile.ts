import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 1024) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkOrientation = () => {
			setIsMobile(window.innerWidth < breakpoint);
		};
		checkOrientation();

		window.addEventListener("resize", checkOrientation);
		return () => window.removeEventListener("resize", checkOrientation);
	}, [breakpoint]);

	return isMobile;
}
