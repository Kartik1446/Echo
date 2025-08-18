import { useRef, useEffect } from "react";

export default function MagnetLines({
	rows = 9,
	columns = 9,
	containerSize = "80vmin",
	lineColor = "#efefef",
	lineWidth = "1vmin",
	lineHeight = "6vmin",
	baseAngle = -10,
	className = "",
	style = {}
}) {
	const containerRef = useRef(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const items = container.querySelectorAll("span");

		let lastX = window.innerWidth / 2;
		let lastY = window.innerHeight / 2;
		let rafId = null;

		const update = () => {
			rafId = null;
			items.forEach((item) => {
				const rect = item.getBoundingClientRect();
				const centerX = rect.x + rect.width / 2;
				const centerY = rect.y + rect.height / 2;
				const deltaX = lastX - centerX;
				const deltaY = lastY - centerY;
				const hypotenuse = Math.sqrt(deltaY * deltaY + deltaX * deltaX) || 1;
				const angleDegrees = ((Math.acos(deltaX / hypotenuse) * 180) / Math.PI) * (lastY > centerY ? 1 : -1);
				item.style.setProperty("--rotate", `${angleDegrees}deg`);
			});
		};

		const requestUpdate = () => {
			if (rafId == null) {
				rafId = window.requestAnimationFrame(update);
			}
		};

		const extractCoords = (event) => {
			if (typeof event.clientX === "number") return { x: event.clientX, y: event.clientY };
			if (event.touches && event.touches[0]) return { x: event.touches[0].clientX, y: event.touches[0].clientY };
			if (typeof event.x === "number") return { x: event.x, y: event.y };
			return { x: lastX, y: lastY };
		};

		const onMove = (e) => {
			const { x, y } = extractCoords(e);
			lastX = x;
			lastY = y;
			requestUpdate();
		};

		window.addEventListener("pointermove", onMove, { passive: true });
		window.addEventListener("mousemove", onMove, { passive: true });
		window.addEventListener("touchmove", onMove, { passive: true });

		// Initial orientation from viewport center
		requestUpdate();

		return () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("touchmove", onMove);
			if (rafId != null) cancelAnimationFrame(rafId);
		};
	}, []);

	const total = rows * columns;
	const spans = Array.from({ length: total }, (_, i) => (
		<span
			key={i}
			className="block origin-center"
			style={{
				backgroundColor: lineColor,
				width: lineWidth,
				height: lineHeight,
				"--rotate": `${baseAngle}deg`,
				transform: "rotate(var(--rotate))",
				willChange: "transform"
			}}
		/>
	));

	return (
		<div
			ref={containerRef}
			className={`grid place-items-center ${className}`}
			style={{
				gridTemplateColumns: `repeat(${columns}, 1fr)`,
				gridTemplateRows: `repeat(${rows}, 1fr)`,
				width: containerSize,
				height: containerSize,
				...style
			}}
		>
			{spans}
		</div>
	);
}


