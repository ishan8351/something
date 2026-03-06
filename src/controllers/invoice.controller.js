import { Invoice } from '../models/Invoice.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import PDFDocument from 'pdfkit';

export const getInvoice = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findOne({
        _id: req.params.id,
        customerId: req.user._id
    }).populate('orderId');

    if (!invoice) throw new ApiError(404, "Invoice not found");

    return res.status(200).json(new ApiResponse(200, invoice, "Invoice details fetched"));
});

export const listMyInvoices = asyncHandler(async (req, res) => {
    const invoices = await Invoice.find({ customerId: req.user._id })
        .populate('orderId')
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, invoices, "Invoices fetched successfully"));
});

export const markAsPaidManual = asyncHandler(async (req, res) => {
    // Note: Assuming Admin role is checked via middleware before reaching here
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) throw new ApiError(404, "Invoice not found");

    if (invoice.status === 'PAID') {
        throw new ApiError(400, "Invoice is already paid");
    }

    invoice.status = 'PAID';
    await invoice.save();

    // If it's an order bill, we also mark the order as processing/completed perhaps
    if (invoice.invoiceType === 'ORDER_BILL' && invoice.orderId) {
        await Order.findByIdAndUpdate(invoice.orderId, { status: 'COMPLETED' /* or SHIPPED */ });
    }

    return res.status(200).json(new ApiResponse(200, invoice, "Invoice marked as paid manually"));
});

export const generateInvoicePDF = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findOne({
        _id: req.params.id,
        // either own invoice or admin route (we'll just check ownership here for simplicity)
        customerId: req.user._id
    }).populate('orderId');

    if (!invoice) throw new ApiError(404, "Invoice not found");

    // Standard pdfkit setup
    const doc = new PDFDocument({ margin: 50 });

    // Stream directly to client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoice.invoiceNumber}.pdf`);
    doc.pipe(res);

    // Business Header
    doc.fontSize(20).text('Sovely E-Commerce', { align: 'right' });
    doc.fontSize(10).text('123 Commerce St.', { align: 'right' });
    doc.text('Business City, BZ 12345', { align: 'right' });
    doc.moveDown();

    // Invoice Title & Details
    doc.fontSize(20).text('INVOICE', 50, 150);
    doc.fontSize(10)
        .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 180)
        .text(`Date Issued: ${new Date(invoice.createdAt).toLocaleDateString()}`, 50, 195)
        .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 210)
        .text(`Terms: ${invoice.paymentTerms}`, 50, 225)
        .text(`Status: ${invoice.status}`, 50, 240);

    doc.moveDown();

    // If Bank transfer
    if (invoice.paymentMethod === 'BANK_TRANSFER' && invoice.status !== 'PAID') {
        doc.moveDown();
        doc.fontSize(12).text('Bank Transfer Instructions', { underline: true });
        doc.fontSize(10).text('Bank: Sovely National Bank');
        doc.text('Account Number: 1234567890');
        doc.text('IFSC Code: SOVE0001234');
        doc.text(`Reference: ${invoice.invoiceNumber}`);
    }

    doc.moveDown(2);

    // Line Items (if it's an order)
    if (invoice.invoiceType === 'ORDER_BILL' && invoice.orderId) {
        doc.fontSize(12).text('Order Summary', { underline: true });
        doc.moveDown();
        const order = invoice.orderId;

        let y = doc.y;
        doc.fontSize(10).text('SKU', 50, y);
        doc.text('Qty', 250, y);
        doc.text('Price', 350, y);
        doc.text('Total', 450, y);
        doc.moveTo(50, y + 15).lineTo(500, y + 15).stroke();

        y += 25;
        for (const item of order.items) {
            doc.text(item.sku, 50, y);
            doc.text(item.qty.toString(), 250, y);
            doc.text(`Rs. ${item.price}`, 350, y);
            doc.text(`Rs. ${item.price * item.qty}`, 450, y);
            y += 20;
        }

        doc.moveTo(50, y).lineTo(500, y).stroke();
        doc.moveDown();
    }

    doc.moveDown(2);
    doc.fontSize(14).text(`Total Amount: Rs. ${invoice.totalAmount}`, { align: 'right' });

    doc.end();
});
