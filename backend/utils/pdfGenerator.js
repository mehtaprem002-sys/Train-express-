const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

async function generateBookingPDF(booking, res) {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    // Stream directly to the response
    doc.pipe(res);

    // --- UTILS ---
    const drawHLine = (y) => {
        doc.moveTo(30, y).lineTo(565, y).strokeColor('#000000').lineWidth(0.5).stroke();
    };

    // --- HEADER ---
    doc.fontSize(14).font('Helvetica-Bold').text('Electronic Reservation Slip (ERS)', { align: 'center' });
    doc.fontSize(8).font('Helvetica').text('Normal User', { align: 'right', baseline: 'top' });

    doc.moveDown(2);

    // --- ROUTE SECTION (Blue Arrow Style) ---
    const startY = doc.y;

    // Left: From
    doc.fontSize(10).font('Helvetica-Bold').text('Booked From', 30, startY, { width: 150, align: 'center' });
    doc.fontSize(12).text(booking.train?.from || 'N/A', 30, startY + 15, { width: 150, align: 'center' });
    doc.fontSize(9).font('Helvetica').text(`Start Date* ${booking.train?.date || 'N/A'}`, 30, startY + 30, { width: 150, align: 'center' });

    // Center: Boarding (Blue Arrow)
    // Draw Arrow Shape
    doc.save();
    doc.translate(200, startY + 10);
    doc.path('M0,0 L180,0 L200,10 L180,20 L0,20 Z').fill('#5daade'); // Light Blue Arrow
    doc.restore();

    doc.fillColor('white').fontSize(10).font('Helvetica-Bold').text('Boarding At', 200, startY + 14, { width: 200, align: 'center' });

    doc.fillColor('black').fontSize(12).text(booking.train?.from || 'N/A', 200, startY + 35, { width: 200, align: 'center' });
    doc.fontSize(9).font('Helvetica').text(`Departure* ${booking.train?.departure || 'N/A'}`, 200, startY + 50, { width: 200, align: 'center' });

    // Right: To
    doc.fontSize(10).font('Helvetica-Bold').text('To', 430, startY, { width: 135, align: 'center' });
    doc.fontSize(12).text(booking.train?.to || 'N/A', 430, startY + 15, { width: 135, align: 'center' });
    doc.fontSize(9).font('Helvetica').text(`Arrival* ${booking.train?.arrival || 'N/A'}`, 430, startY + 30, { width: 135, align: 'center' });

    doc.moveDown(4);

    // --- TRAIN DETAILS BOX ---
    const boxY = doc.y + 10;
    doc.rect(30, boxY, 535, 60).stroke();

    // Row 1: Headers
    let currentY = boxY + 5;
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('PNR', 40, currentY);
    doc.text('Train No./Name', 180, currentY);
    doc.text('Class', 400, currentY);

    // Row 1: Values
    currentY += 12;
    doc.fontSize(11).font('Helvetica');
    doc.text(booking.pnr || 'N/A', 40, currentY);
    doc.text(`${booking.train?.number} / ${booking.train?.name}`, 180, currentY);
    doc.text(booking.class?.type || 'N/A', 400, currentY);

    // Row 2: Headers
    currentY += 18;
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Quota', 40, currentY);
    doc.text('Distance', 180, currentY);
    doc.text('Booking Date', 400, currentY);

    // Row 2: Values
    currentY += 12;
    doc.fontSize(10).font('Helvetica');
    doc.text('GENERAL (GN)', 40, currentY);
    doc.text('N/A', 180, currentY);
    doc.text(new Date(booking.createdAt).toLocaleDateString(), 400, currentY);

    doc.y = boxY + 70;

    // --- PASSENGER DETAILS TABLE ---
    doc.fontSize(11).font('Helvetica-Bold').text('Passenger Details', 30, doc.y);
    doc.moveDown(0.5);

    const tableTop = doc.y;
    // Table Headers
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('#', 35, tableTop);
    doc.text('Name', 60, tableTop);
    doc.text('Age', 200, tableTop);
    doc.text('Gender', 240, tableTop);
    doc.text('Booking Status', 300, tableTop);
    doc.text('Current Status', 420, tableTop);

    drawHLine(tableTop + 12);

    // Table Content
    let rowY = tableTop + 15;
    doc.font('Helvetica').fontSize(9);

    if (booking.passengers && booking.passengers.length > 0) {
        booking.passengers.forEach((p, i) => {
            doc.text((i + 1).toString(), 35, rowY);
            doc.text(p.name, 60, rowY);
            doc.text(p.age, 200, rowY);
            doc.text(p.gender, 240, rowY);
            doc.text(`CNF/${p.coach}/${p.seatNumber}/${p.berthType}`, 300, rowY);
            doc.text(`CNF/${p.coach}/${p.seatNumber}/${p.berthType}`, 420, rowY);
            rowY += 15;
        });
    }

    drawHLine(rowY);
    doc.y = rowY + 10;

    // --- PAYMENT & QR SECTION ---
    const lowerSectionY = doc.y + 10;

    // Left: Payment Text
    doc.fontSize(11).font('Helvetica-Bold').text('Payment Details', 30, lowerSectionY);
    doc.fontSize(9).font('Helvetica');

    let payY = lowerSectionY + 20;

    doc.text('Ticket Fare', 30, payY);
    doc.text(`₹ ${(booking.paymentDetails?.amount || 0) - 11.80}`, 200, payY);
    payY += 15;

    doc.text('IRCTC Convenience Fee', 30, payY);
    doc.text(`₹ 11.80`, 200, payY);
    payY += 15;

    doc.font('Helvetica-Bold').text('Total Fare (all inclusive)', 30, payY);
    doc.text(`₹ ${booking.paymentDetails?.amount}`, 200, payY);

    // Right: QR Code
    try {
        const qrData = JSON.stringify({
            pnr: booking.pnr,
            id: booking._id
        });
        const qrImage = await QRCode.toDataURL(qrData);
        doc.image(qrImage, 450, lowerSectionY, { width: 100, height: 100 });
    } catch (e) { console.error(e); }

    // --- INSTRUCTIONS ---
    doc.y = Math.max(payY + 30, lowerSectionY + 110);
    doc.fontSize(8).font('Helvetica');

    doc.text('1. Prescribed Original ID proof is required while travelling along with SMS/ VRM/ ERS otherwise will be treated as without ticket and penalized.', 30, doc.y, { width: 535 });
    doc.moveDown(0.5);
    doc.text('2. IR recovers only 57% of cost of travel on an average.', { width: 535 });
    doc.moveDown(0.5);
    doc.text('This is a simulated ticket for TrainExpress Demo.', { align: 'center' });

    doc.end();
}

module.exports = { generateBookingPDF };
