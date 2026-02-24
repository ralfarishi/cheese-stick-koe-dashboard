import html2canvas from "html2canvas-pro";

export async function exportInvoiceToPng(
	element: HTMLElement | null,
	filename: string = "Invoice.png",
): Promise<void> {
	if (!element) return;

	const width = element.scrollWidth;
	const height = element.scrollHeight;

	const canvas = await html2canvas(element, {
		scale: 1,
		useCORS: true,
		logging: true,
		scrollX: 0,
		scrollY: 0,
		windowWidth: width,
		windowHeight: height,
		backgroundColor: "#ffffff",
		onclone: (clonedDoc) => {
			const style = clonedDoc.createElement("style");
			style.innerHTML = `@import url("https://fonts.googleapis.com/css2?family=Pattaya&family=Poppins:wght@300;400;500;600;700&display=swap");`;
			clonedDoc.head.appendChild(style);

			// Copy CSS variables from original body to cloned body
			const bodyStyles = window.getComputedStyle(document.body);
			for (let i = 0; i < bodyStyles.length; i++) {
				const prop = bodyStyles[i];
				if (prop.startsWith("--font") || prop.startsWith("--color")) {
					clonedDoc.documentElement.style.setProperty(prop, bodyStyles.getPropertyValue(prop));
				}
			}
		},
	});

	const link = document.createElement("a");
	link.download = filename;
	link.href = canvas.toDataURL("image/png");

	return new Promise((resolve) => {
		link.click();
		resolve();
	});
}

