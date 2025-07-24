import html2canvas from "html2canvas-pro";

export async function exportInvoiceToPng(element, filename = "Invoice.png") {
	const canvas = await html2canvas(element, { scale: 2 });
	const link = document.createElement("a");
	link.download = filename;
	link.href = canvas.toDataURL("image/png");

	return new Promise((resolve) => {
		link.click();
		resolve();
	});
}
