export type CrewmateColor =
	| "red"
	| "cyan"
	| "lime"
	| "pink"
	| "yellow"
	| "orange"
	| "purple"
	| "blue"
	| "white"
	| "black";

export type CrewmateHat =
	| "none"
	| "sticky"
	| "plant"
	| "egg"
	| "crown"
	| "pompom"
	| "toilet"
	| "viking"
	| "chef";

// Color palettes matching actual Among Us colors
export const CREWMATE_COLORS: Record<
	CrewmateColor,
	{ fill: string; shadow: string; name: string }
> = {
	red: { fill: "#C51111", shadow: "#7A0808", name: "Red" },
	cyan: { fill: "#38FEDE", shadow: "#1FADB3", name: "Cyan" },
	lime: { fill: "#50F01E", shadow: "#329A13", name: "Lime" },
	pink: { fill: "#ED54BA", shadow: "#AB3288", name: "Pink" },
	yellow: { fill: "#F5F557", shadow: "#BAA21B", name: "Yellow" },
	orange: { fill: "#F07D0D", shadow: "#9F5004", name: "Orange" },
	purple: { fill: "#6B2FBC", shadow: "#441880", name: "Purple" },
	blue: { fill: "#132ED1", shadow: "#09158E", name: "Blue" },
	white: { fill: "#D6E0F0", shadow: "#8394A7", name: "White" },
	black: { fill: "#3F474E", shadow: "#212529", name: "Black" },
};

export const CREWMATE_HATS: Record<
	CrewmateHat,
	{ name: string; emoji: string }
> = {
	none: { name: "No Hat", emoji: "🧑‍🚀" },
	sticky: { name: "Sticky Note", emoji: "📝" },
	plant: { name: "Leaf Sprout", emoji: "🌱" },
	egg: { name: "Fried Egg", emoji: "🍳" },
	crown: { name: "Golden Crown", emoji: "👑" },
	pompom: { name: "Pom Pom", emoji: "🎈" },
	toilet: { name: "Toilet Paper", emoji: "🧻" },
	viking: { name: "Viking Horns", emoji: "🪖" },
	chef: { name: "Chef Hat", emoji: "👨‍🍳" },
};
