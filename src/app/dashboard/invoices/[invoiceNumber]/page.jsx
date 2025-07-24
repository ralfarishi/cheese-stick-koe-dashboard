import UpdateInvoiceForm from "../UpdateInvoiceForm";

import { getInvoiceByNumber } from "@/lib/actions/invoice/getInvoiceByNumber";

export default async function UpdateInvoicePage(props) {
	const { invoiceNumber } = await props.params;

	if (!invoiceNumber) return <div className="text-red-500">Invoice number not found</div>;

	const { data: invoice, error } = await getInvoiceByNumber(invoiceNumber);

	if (error || !invoice) {
		return <div className="text-red-500">Invoice not found</div>;
	}

	return <UpdateInvoiceForm invoice={invoice} />;
}
