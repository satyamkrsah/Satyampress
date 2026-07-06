const PDFDocument = require('pdfkit');
const Order = require('../models/Order');
const fs = require('fs');

// @desc    Download invoice PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
exports.downloadInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('shippingAddress')
      .populate('billingAddress');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Check authorization (user who owns it, or admin)
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to download this invoice' });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Stream the PDF to the response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${order.invoiceNumber}.pdf`
    );

    doc.pipe(res);

    // Header
    doc
      .fillColor('#444444')
      .fontSize(20)
      .text('Satyam Printing Press', 50, 57)
      .fontSize(10)
      .text('123 Printing Lane', 200, 50, { align: 'right' })
      .text('New Delhi, DL 110001', 200, 65, { align: 'right' })
      .text('Phone: +91 9876543210', 200, 80, { align: 'right' })
      .moveDown();

    // Line
    doc.moveTo(50, 110).lineTo(550, 110).stroke();

    // Invoice details
    doc
      .fontSize(20)
      .text('INVOICE', 50, 130);
      
    doc
      .fontSize(10)
      .text(`Invoice Number: ${order.invoiceNumber}`, 50, 160)
      .text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 175)
      .text(`Order Status: ${order.orderStatus.toUpperCase()}`, 50, 190);

    // Customer details
    const shipping = order.shippingAddress;
    doc
      .text('Bill To:', 300, 130)
      .font('Helvetica-Bold')
      .text(shipping.fullName, 300, 145)
      .font('Helvetica')
      .text(`${shipping.street}`, 300, 160)
      .text(`${shipping.city}, ${shipping.state} ${shipping.zipCode}`, 300, 175)
      .text(`Phone: ${shipping.phoneNumber}`, 300, 190);

    doc.moveTo(50, 220).lineTo(550, 220).stroke();

    // Table Header
    let invoiceTableTop = 250;
    doc.font('Helvetica-Bold');
    doc.text('Item', 50, invoiceTableTop);
    doc.text('Customizations', 200, invoiceTableTop);
    doc.text('Unit Price', 380, invoiceTableTop, { width: 90, align: 'right' });
    doc.text('Qty', 470, invoiceTableTop, { width: 40, align: 'right' });
    doc.text('Total', 510, invoiceTableTop, { width: 40, align: 'right' });
    
    doc.moveTo(50, invoiceTableTop + 15).lineTo(550, invoiceTableTop + 15).stroke();

    // Table Rows
    doc.font('Helvetica');
    let position = invoiceTableTop + 30;
    
    order.items.forEach(item => {
      let customStr = '';
      if(item.customizations) {
         const vals = Object.values(item.customizations).filter(Boolean);
         if(vals.length > 0) customStr = vals.join(', ');
      }

      doc.text(item.name, 50, position, { width: 140 });
      doc.text(customStr, 200, position, { width: 170 });
      doc.text(`Rs. ${item.price}`, 380, position, { width: 90, align: 'right' });
      doc.text(item.quantity, 470, position, { width: 40, align: 'right' });
      doc.text(`Rs. ${item.price * item.quantity}`, 510, position, { width: 40, align: 'right' });
      
      position += 30;
      // Handle page breaks if table is long
      if(position > 700) {
        doc.addPage();
        position = 50;
      }
    });

    doc.moveTo(50, position).lineTo(550, position).stroke();
    
    // Totals
    const subtotalPosition = position + 15;
    doc.font('Helvetica-Bold');
    doc.text('Subtotal:', 380, subtotalPosition, { width: 90, align: 'right' });
    doc.text(`Rs. ${order.subTotal}`, 510, subtotalPosition, { width: 40, align: 'right' });

    doc.text('GST (18%):', 380, subtotalPosition + 15, { width: 90, align: 'right' });
    doc.text(`Rs. ${Math.round(order.taxTotal)}`, 510, subtotalPosition + 15, { width: 40, align: 'right' });

    doc.text('Shipping:', 380, subtotalPosition + 30, { width: 90, align: 'right' });
    doc.text(`Rs. ${order.shippingTotal}`, 510, subtotalPosition + 30, { width: 40, align: 'right' });

    if(order.discountTotal > 0) {
      doc.text('Discount:', 380, subtotalPosition + 45, { width: 90, align: 'right' });
      doc.text(`-Rs. ${order.discountTotal}`, 510, subtotalPosition + 45, { width: 40, align: 'right' });
    }

    const totalPosition = order.discountTotal > 0 ? subtotalPosition + 60 : subtotalPosition + 45;
    doc.fontSize(14);
    doc.text('Total:', 380, totalPosition, { width: 90, align: 'right' });
    doc.text(`Rs. ${Math.round(order.grandTotal)}`, 510, totalPosition, { width: 40, align: 'right' });

    // Footer
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(
        'Thank you for your business. Payment is due within 15 days.',
        50,
        700,
        { align: 'center', width: 500 }
      );

    // Finalize PDF
    doc.end();

  } catch (err) {
    next(err);
  }
};
