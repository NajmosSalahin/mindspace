import PDFDocument from 'pdfkit';
import cloudinary from '../config/cloudinary.js';
import Certificate from '../models/Certificate.js';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import { sendEmail } from '../services/email.js';

export const generateCertificates = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('organizerId', 'name');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const tickets = await Ticket.find({ eventId: event._id, status: 'active', checkedIn: true }).populate('userId', 'name email');
    const certificates = [];
    for (const ticket of tickets) {
      const existingCert = await Certificate.findOne({ userId: ticket.userId._id, eventId: event._id });
      if (existingCert) {
        certificates.push(existingCert);
        continue;
      }
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      await new Promise((resolve) => {
        doc.on('end', resolve);
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0A0F1E');
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).fill('transparent').stroke('#4F46E5', 2);
        doc.font('Helvetica-Bold').fontSize(36).fillColor('#4F46E5').text('Certificate of Attendance', { align: 'center', y: 120 });
        doc.font('Helvetica').fontSize(18).fillColor('#fff').text('This is to certify that', { align: 'center', y: 200 });
        doc.font('Helvetica-Bold').fontSize(28).fillColor('#F59E0B').text(ticket.userId.name, { align: 'center', y: 240 });
        doc.font('Helvetica').fontSize(16).fillColor('#fff').text(`has attended "${event.title}"`, { align: 'center', y: 300 });
        doc.font('Helvetica').fontSize(14).fillColor('rgba(255,255,255,0.6)').text(`Date: ${new Date(event.date).toLocaleDateString()}`, { align: 'center', y: 360 });
        doc.font('Helvetica').fontSize(12).fillColor('rgba(255,255,255,0.4)').text(`Organized by ${event.organizerId.name}`, { align: 'center', y: 400 });
        doc.end();
      });
      const buffer = Buffer.concat(buffers);
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'certificates', resource_type: 'image', format: 'pdf' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
      const cert = await Certificate.create({
        userId: ticket.userId._id,
        eventId: event._id,
        orderId: ticket.orderId,
        certificateUrl: result.secure_url,
      });
      certificates.push(cert);
      await sendEmail({
        to: ticket.userId.email,
        subject: `Certificate for ${event.title}`,
        html: `<p>Your certificate for ${event.title} is ready. <a href="${result.secure_url}">Download here</a></p>`,
      });
    }
    res.json({ success: true, data: certificates, count: certificates.length });
  } catch (error) {
    next(error);
  }
};

export const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ userId: req.user._id })
      .populate('eventId', 'title date')
      .sort({ issuedAt: -1 });
    res.json({ success: true, data: certificates });
  } catch (error) {
    next(error);
  }
};

export const downloadCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert || (cert.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    res.redirect(cert.certificateUrl);
  } catch (error) {
    next(error);
  }
};
