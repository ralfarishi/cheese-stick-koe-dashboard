"use client";

import { useEffect, useRef, useState } from "react";
import { useSpring, useMotionValue } from "framer-motion";

const DOT_SPACING = 35;

export default function InteractiveBackground() {
	const containerRef = useRef(null);
	const dotRefs = useRef([]);
	const dotsData = useRef([]);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	const mouseX = useMotionValue(-1000);
	const mouseY = useMotionValue(-1000);

	// Smoother springs for the mouse to handle high-speed flicks
	const springConfig = { damping: 40, stiffness: 300, mass: 0.1 };
	const smoothX = useSpring(mouseX, springConfig);
	const smoothY = useSpring(mouseY, springConfig);

	useEffect(() => {
		const updateDimensions = () => {
			if (containerRef.current) {
				const w = containerRef.current.offsetWidth;
				const h = containerRef.current.offsetHeight;
				setDimensions({ width: w, height: h });

				// Initialize dot data
				const cols = Math.ceil(w / DOT_SPACING) + 2;
				const rows = Math.ceil(h / DOT_SPACING) + 2;
				const data = [];
				for (let i = 0; i < cols * rows; i++) {
					data.push({
						x: (i % cols) * DOT_SPACING - DOT_SPACING,
						y: Math.floor(i / cols) * DOT_SPACING - DOT_SPACING,
					});
				}
				dotsData.current = data;
			}
		};

		updateDimensions();
		window.addEventListener("resize", updateDimensions);

		const handleMouseMove = (e) => {
			if (!containerRef.current) return;
			const rect = containerRef.current.getBoundingClientRect();
			mouseX.set(e.clientX - rect.left);
			mouseY.set(e.clientY - rect.top);
		};

		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("resize", updateDimensions);
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, [mouseX, mouseY]);

	useEffect(() => {
		let rafId;
		const update = (time) => {
			const mx = smoothX.get();
			const my = smoothY.get();
			const radius = 550;
			const strength = 0.5;
			const t = time / 1000;

			dotsData.current.forEach((dot, i) => {
				const el = dotRefs.current[i];
				if (!el) return;

				const dx = mx - dot.x;
				const dy = my - dot.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < radius) {
					const distFactor = 1 - distance / radius;

					// DEAD ZONE: Hide dots very close to the cursor
					const deadRadius = 70; // Area where dots are invisible
					const fadeEdge = 100; // Smooth transition edge
					let visibilityFactor = 1;

					if (distance < deadRadius) {
						visibilityFactor = 0;
					} else if (distance < fadeEdge) {
						visibilityFactor = (distance - deadRadius) / (fadeEdge - deadRadius);
					}

					// Core 3D Lens Warp
					const lensFactor = distFactor ** 2 * strength;
					let moveX = dx * lensFactor;
					let moveY = dy * lensFactor;

					// RIPPLE WAVE
					const waveFreq = 30;
					const waveSpeed = 6;
					const waveAmp = 15;

					const waveValue = Math.sin(distance / waveFreq - t * waveSpeed);
					const rippleX = (dx / (distance || 1)) * waveValue * waveAmp * distFactor;
					const rippleY = (dy / (distance || 1)) * waveValue * waveAmp * distFactor;

					moveX += rippleX;
					moveY += rippleY;

					// Animate Scale & Opacity with wave and dead zone
					const pulse = (waveValue + 1) / 2;
					const scale = (1 + distFactor * 1.5 + pulse * distFactor * 0.5) * visibilityFactor;
					const opacity = (0.2 + distFactor * 0.8) * (0.8 + pulse * 0.2) * visibilityFactor;

					el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(${scale})`;
					el.style.opacity = opacity;
				} else {
					el.style.transform = `translate3d(0, 0, 0) scale(1)`;
					el.style.opacity = 0.2;
				}
			});

			rafId = requestAnimationFrame(update);
		};

		rafId = requestAnimationFrame(update);
		return () => cancelAnimationFrame(rafId);
	}, [smoothX, smoothY]);

	return (
		<div
			ref={containerRef}
			className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 hidden md:block"
		>
			<div className="relative w-full h-full opacity-40">
				{dotsData.current.map((dot, i) => (
					<div
						key={i}
						ref={(el) => (dotRefs.current[i] = el)}
						className="absolute w-1 h-1 bg-[#8B2E1F] rounded-full pointer-events-none"
						style={{
							left: dot.x,
							top: dot.y,
							willChange: "transform, opacity",
							opacity: 0.2,
						}}
					/>
				))}
			</div>

			<div className="absolute inset-0 bg-radial-[at_50%_50%] from-transparent to-[#FCF9F1] opacity-40 z-10" />
		</div>
	);
}
