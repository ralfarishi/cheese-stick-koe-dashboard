import html2canvas from "html2canvas-pro";

export async function exportInvoiceToPng(element, filename = "Invoice.png") {
	if (!element) return;

	const width = element.scrollWidth;
	const height = element.scrollHeight;

	const canvas = await html2canvas(element, {
		scale: 2,
		scrollX: 0,
		scrollY: 0,
		width,
		height,
		windowWidth: width,
		windowHeight: height,
		backgroundColor: "#ffffff",
	});

	const link = document.createElement("a");
	link.download = filename;
	link.href = canvas.toDataURL("image/png");

	return new Promise((resolve) => {
		link.click();
		resolve();
	});
}
