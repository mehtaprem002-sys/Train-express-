const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

async function generateBookingPDF(booking, res) {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    doc.pipe(res);

    function drawHorizontalLine(yOffset, color = '#666666', width = 0.5) {
        doc.moveTo(25, yOffset).lineTo(570, yOffset).strokeColor(color).lineWidth(width).stroke();
    }

    // --- Outer Frame ---
    // A4 is 595.28 x 841.89
    doc.rect(20, 20, 555, 800).lineWidth(1).strokeColor('#cccccc').stroke();
    doc.rect(23, 23, 549, 794).lineWidth(0.5).strokeColor('#dddddd').stroke();

    // --- Header ---
    doc.fontSize(12).font('Helvetica-Bold');
    const title = 'Electronic Reservation Slip (ERS)';
    const titleWidth = doc.widthOfString(title);
    doc.fillColor('black').text(title, 0, 35, { align: 'center' });
    
    doc.fontSize(8).font('Helvetica');
    const subtitle = '-Normal User';
    doc.text(subtitle, (595.28 + titleWidth) / 2 + 2, 38);

    // Train Express Logo (Custom single round graphic)
    doc.save();
    doc.circle(60, 50, 22).lineWidth(2).strokeColor('#0f4c81').stroke();
    // Inner filled circle
    doc.circle(60, 50, 18).fill('#1877F2');
    
    // "TE" Monogram
    doc.fillColor('white').font('Helvetica-Bold').fontSize(16);
    doc.text('TE', 49, 43); 
    
    // Label under circle
    doc.fillColor('#0f4c81').fontSize(8);
    doc.text('TRAIN EXPRESS', 25, 75, { width: 70, align: 'center' });
    doc.restore();
    
    let y = 90;

    // --- Journey Details Block ---
    doc.fillColor('black');
    doc.fontSize(10).font('Helvetica-Bold').text('Booked from', 30, y, { width: 150, align: 'center' });
    doc.fontSize(12).text((booking.train?.from || 'N/A').toUpperCase(), 30, y + 15, { width: 150, align: 'center' });
    doc.fontSize(9).font('Helvetica').text(`Start Date* ${booking.train?.date || 'N/A'}`, 30, y + 30, { width: 150, align: 'center' });
    doc.font('Helvetica-Bold').text('CHECK TIMINGS BEFORE BOARDING', 30, y + 45, { width: 150, align: 'center' });

    // Center Arrow & Boarding At
    const arrowY = y;
    doc.save();
    doc.translate(225, arrowY + 2);
    doc.path('M0,0 L120,0 L135,10 L120,20 L0,20 Z').fill('#7fb3d5');
    doc.restore();
    doc.fillColor('white').fontSize(10).font('Helvetica-Bold').text('Boarding At', 225, arrowY + 7, { width: 120, align: 'center' });
    
    doc.fillColor('black');
    doc.fontSize(12).text((booking.train?.from || 'N/A').toUpperCase(), 210, y + 25, { width: 150, align: 'center' });
    doc.fontSize(9).font('Helvetica-Bold').text(`Departure* ${booking.train?.departure || 'N/A'}`, 210, y + 40, { width: 150, align: 'center' });

    // To
    doc.fontSize(10).font('Helvetica-Bold').text('To', 415, y, { width: 150, align: 'center' });
    doc.fontSize(12).text((booking.train?.to || 'N/A').toUpperCase(), 415, y + 15, { width: 150, align: 'center' });
    doc.fontSize(9).font('Helvetica').text(`Arrival* ${booking.train?.arrival || 'N/A'}`, 415, y + 30, { width: 150, align: 'center' });

    y += 70;

    // --- Train Details Table ---
    const tCol1 = 25, tCol2 = 208, tCol3 = 386;
    const tWidth = 183;
    
    // Outer table completely drawn
    doc.rect(25, y, 545, 65).lineWidth(1).strokeColor('black').stroke();
    // V lines
    doc.moveTo(208, y).lineTo(208, y + 65).stroke();
    doc.moveTo(386, y).lineTo(386, y + 65).stroke();
    // H line
    doc.moveTo(25, y + 35).lineTo(570, y + 35).stroke();

    doc.font('Helvetica-Bold').fontSize(10).fillColor('black');
    doc.text('PNR', tCol1, y + 5, { width: tWidth, align: 'center' });
    doc.text('Train No./Name', tCol2, y + 5, { width: tWidth, align: 'center' });
    doc.text('Class', tCol3, y + 5, { width: tWidth, align: 'center' });
    
    doc.fillColor('#1d4e89').fontSize(12);
    doc.text(booking.pnr || 'N/A', tCol1, y + 18, { width: tWidth, align: 'center' });
    doc.text(`${booking.train?.number || ''}/${(booking.train?.name || '').toUpperCase()}`, tCol2, y + 18, { width: tWidth, align: 'center' });
    doc.text((booking.class?.type || 'N/A').toUpperCase() + ' (2S)', tCol3, y + 18, { width: tWidth, align: 'center' });

    doc.fillColor('black').font('Helvetica-Bold').fontSize(10);
    doc.text('Quota', tCol1, y + 40, { width: tWidth, align: 'center' });
    doc.text('Distance', tCol2, y + 40, { width: tWidth, align: 'center' });
    doc.text('Booking Date', tCol3, y + 40, { width: tWidth, align: 'center' });

    doc.font('Helvetica').fontSize(9);
    doc.text('GENERAL (GN)', tCol1, y + 53, { width: tWidth, align: 'center' });
    doc.text('321 KM', tCol2, y + 53, { width: tWidth, align: 'center' });
    const formattedDate = new Date(booking.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' HRS';
    doc.text(formattedDate.replace(/,/g, ''), tCol3, y + 53, { width: tWidth, align: 'center' });

    y += 75;

    // --- Passenger Details ---
    doc.font('Helvetica-Bold').fontSize(11).fillColor('black').text('Passenger Details', 25, y);
    doc.moveTo(25, y + 14).lineTo(130, y + 14).lineWidth(1).stroke();

    y += 20;
    const pHeaderRowH = 15;
    doc.rect(25, y, 545, pHeaderRowH).fillAndStroke('#f0f0f0', 'black');
    
    doc.fillColor('black').font('Helvetica-Bold').fontSize(9);
    doc.text('#   Name', 35, y + 4);
    doc.text('Age', 220, y + 4, { width: 40, align: 'center' });
    doc.text('Gender', 280, y + 4, { width: 40, align: 'center' });
    doc.text('Booking Status', 340, y + 4);
    doc.text('Current Status', 460, y + 4);

    let currentY = y + pHeaderRowH;
    doc.font('Helvetica').fontSize(9);
    
    if (booking.passengers && booking.passengers.length > 0) {
        booking.passengers.forEach((p, i) => {
            const rowNo = (i + 1).toString() + '.';
            doc.text(rowNo, 30, currentY + 5);
            doc.text((p.name || '').toUpperCase(), 50, currentY + 5);
            doc.text((p.age?.toString() || ''), 220, currentY + 5, { width: 40, align: 'center' });
            doc.text((p.gender?.charAt(0) || '').toUpperCase(), 280, currentY + 5, { width: 40, align: 'center' });
            
            // Format example: CNF/D4/19/WINDOW SIDE
            let bt = p.berthType ? p.berthType.toUpperCase() : '';
            if(bt === 'WINDOW') bt = 'WINDOW SIDE';
            if(bt === 'NO PREFERENCE') bt = 'NO CHOICE';
            if(!bt) bt = 'NO CHOICE';

            const pStatus = `CNF/${p.coach || ''}/${p.seatNumber || ''}/${bt}`;
            doc.text(pStatus, 340, currentY + 5);
            doc.text(pStatus, 460, currentY + 5);
            
            currentY += 15;
        });
    } else {
        currentY += 15;
    }
    // Border for passengers
    doc.rect(25, y, 545, currentY - y).strokeColor('black').lineWidth(1).stroke();

    currentY += 10;
    doc.fontSize(6).fillColor('#666666');
    doc.text('Acronyms:               RLWL: REMOTE LOCATION WAITLIST               PQWL: POOLED QUOTA WAITLIST               RSWL: ROAD-SIDE WAITLIST', 30, currentY);

    currentY += 15;
    // Transaction ID
    doc.font('Helvetica-Bold').fontSize(10).fillColor('black').text('Transaction ID: 100006284951915', 30, currentY);
    currentY += 15;
    doc.font('Helvetica').fontSize(9).text('IR recovers only 57% of cost of travel on an average.', 30, currentY);

    currentY += 10;
    doc.font('Helvetica-Bold').fontSize(11).text('Payment Details', 30, currentY);
    doc.moveTo(30, currentY + 14).lineTo(120, currentY + 14).stroke();

    currentY += 20;
    const payTableY = currentY;
    
    const totalAmount = booking.paymentDetails?.amount || 0;
    const fee = 11;
    const base = Math.max(0, totalAmount - fee).toFixed(2);
    
    doc.font('Helvetica').fontSize(9);
    doc.text('Ticket Fare', 35, currentY);
    doc.text('₹ ' + base, 230, currentY);
    currentY += 15;
    doc.text('IRCTC Convenience Fee (Incl. of GST)', 35, currentY);
    doc.text('₹ ' + fee.toFixed(2), 230, currentY);
    currentY += 15;
    doc.font('Helvetica-Bold').text('Total Fare (all inclusive)', 35, currentY);
    doc.text('₹ ' + totalAmount.toFixed(2), 230, currentY);
    currentY += 18;
    doc.font('Helvetica').fontSize(8).text('PG Charges as applicable (Additional)', 35, currentY);

    // Render QR Code
    try {
        const qrData = JSON.stringify({ pnr: booking.pnr, id: booking._id });
        const qrImage = await QRCode.toDataURL(qrData);
        doc.image(qrImage, 420, payTableY - 5, { width: 100, height: 100 });
    } catch (e) {
        console.error('QR Generate Error:', e);
    }

    currentY = Math.max(currentY + 20, payTableY + 105);

    // --- Footer Instructions ---
    drawHorizontalLine(currentY);
    currentY += 10;

    let tOpts = { width: 535, align: 'left', lineGap: 3 };

    doc.font('Helvetica-Bold').fontSize(8);
    doc.text('•  Beware of fraudulent customer care number. For any assistance, use only the IRCTC e-ticketing Customer care number: 14646.', 25, currentY, tOpts);
    currentY = doc.y + 2;
    doc.text('   IRCTC Convenience Fee is charged per e-ticket irrespective of number of passengers on the ticket.', 25, currentY, tOpts);
    currentY = doc.y + 2;
    doc.text('•  The printed Departure and Arrival Times are liable to change. Please Check correct departure, arrival from Railway Station Enquiry or Dial 139 or SMS RAIL to 139.', 25, currentY, tOpts);
    currentY = doc.y + 4;

    drawHorizontalLine(currentY, 'black', 1);
    currentY += 8;

    doc.font('Helvetica').fontSize(8);
    doc.text('•  This ticket is booked on a personal User ID, its sale/purchase is an offence u/s 143 of the Railways Act, 1989.', 25, currentY, tOpts);
    currentY = doc.y + 2;
    doc.text('•  Prescribed original ID proof is required while travelling along with SMS/ VRM/ ERS otherwise will be treated as without ticket and penalized as per Railway Rules.', 25, currentY, tOpts);

    currentY = doc.y + 12;
    doc.font('Helvetica-Bold').fontSize(8).text('Indian Railways GST Details:', 25, currentY);
    currentY = doc.y + 6;

    doc.font('Helvetica');
    doc.text(`Invoice Number:`, 25, currentY);
    doc.text(`PS${booking.pnr}511`, 120, currentY);
    doc.text(`Address:`, 280, currentY);
    doc.text(`Indian Railways New Delhi`, 350, currentY);
    
    currentY = doc.y + 6;
    doc.font('Helvetica-Bold').text('Supplier Information:', 25, currentY);
    currentY = doc.y + 6;
    doc.font('Helvetica');
    doc.text('SAC Code:', 25, currentY);
    doc.text('996421', 120, currentY);
    doc.text('GSTIN:', 280, currentY);
    doc.text('07AAAGM0289C1ZL', 350, currentY);
    
    currentY = doc.y + 6;
    doc.font('Helvetica-Bold').text('Recipient Information:', 25, currentY);
    currentY = doc.y + 6;
    doc.font('Helvetica');
    doc.text('GSTIN:', 25, currentY);
    doc.text('NA', 120, currentY);
    
    currentY = doc.y + 4;
    doc.text(`Name:`, 25, currentY);
    doc.text(booking.passengers?.[0]?.name ? booking.passengers[0].name.toUpperCase() : 'NA', 120, currentY);
    doc.text('Address:', 280, currentY);
    doc.text('NA', 350, currentY);
    
    currentY = doc.y + 4;
    doc.text(`Taxable Value:`, 25, currentY);
    doc.text(base, 120, currentY);

    currentY = doc.y + 15;
    drawHorizontalLine(currentY, '#cccccc', 2);
    currentY += 10;
    
    doc.font('Helvetica-Bold').fontSize(7.5).text('INSTRUCTIONS:', 25, currentY);
    doc.font('Helvetica').fontSize(7);
    const instructions = `1. Prescribed Original ID proofs are:- Voter Identity Card / Passport / PAN Card / Driving License / Photo ID card issued by Central / State Govt. / Public Sector Undertakings of State / Central Government, District Administrations, Municipal bodies and Panchayat Administrations which are having serial number / Student Identity Card with photograph issued by recognized School or College for their students / Nationalized Bank Passbook with photograph / Credit Cards issued by Banks with laminated photograph/Unique Identification Card "Aadhaar", m-Aadhaar, e-Aadhaar.
2. PNRs having fully waitlisted status will be dropped and automatic refund of the ticket amount after deducting the applicable CLERKAGE by Railway shall be credited to the account used for payment for booking of the ticket. Passengers having fully waitlisted e-ticket are not allowed to board the train.
3. Passengers travelling on a fully waitlisted e-ticket will be treated as Ticketless.
4. Never purchase e-ticket from unauthorized agents or persons using their personal IDs for commercial purposes. Such tickets are liable to be cancelled and forfeited without any refund of money, under section (143) of the Indian Railway Act 1989.`;
    doc.text(instructions, 25, currentY + 12, { width: 545, align: 'justify' });

    doc.end();
}

module.exports = { generateBookingPDF };
