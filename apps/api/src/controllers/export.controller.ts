import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();

export const exportMembers = async (req: Request, res: Response) => {
    try {
        const format = req.query.format as string;
        const members = await prisma.member.findMany({
            orderBy: { id: 'asc' }
        });

        if (format === 'csv') {
            const csvRows = [];
            // Header
            csvRows.push(['ID', 'First Name', 'Last Name', 'Gender', 'DOB', 'Contact', 'Native Place', 'Address', 'Notes'].join(','));

            // Data
            members.forEach(member => {
                const row = [
                    member.id,
                    member.firstName,
                    member.lastName,
                    'Unknown', // Gender not in DB yet effectively or untyped
                    member.dob ? new Date(member.dob).toISOString().split('T')[0] : '',
                    member.contactNumber || '',
                    member.nativePlace || '',
                    `"${(member.address || '').replace(/"/g, '""')}"`, // Escape quotes
                    `"${(member.notes || '').replace(/"/g, '""')}"`
                ];
                csvRows.push(row.join(','));
            });

            res.header('Content-Type', 'text/csv');
            res.attachment('members_export.csv');
            return res.send(csvRows.join('\n'));
        }

        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Members');

            sheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'First Name', key: 'firstName', width: 20 },
                { header: 'Last Name', key: 'lastName', width: 20 },
                { header: 'DOB', key: 'dob', width: 15 },
                { header: 'Contact', key: 'contactNumber', width: 15 },
                { header: 'Native Place', key: 'nativePlace', width: 20 },
                { header: 'Address', key: 'address', width: 30 },
                { header: 'Notes', key: 'notes', width: 30 },
            ];

            members.forEach(member => {
                sheet.addRow({
                    id: member.id,
                    firstName: member.firstName,
                    lastName: member.lastName,
                    dob: member.dob ? new Date(member.dob).toISOString().split('T')[0] : '',
                    contactNumber: member.contactNumber || '',
                    nativePlace: member.nativePlace || '',
                    address: member.address || '',
                    notes: member.notes || ''
                });
            });

            res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.attachment('members_export.xlsx');
            await workbook.xlsx.write(res);
            return res.end();
        }

        if (format === 'pdf') {
            const doc = new PDFDocument();
            res.header('Content-Type', 'application/pdf');
            res.attachment('members_export.pdf');

            doc.pipe(res);

            doc.fontSize(20).text('Family Tree Members', { align: 'center' });
            doc.moveDown();

            members.forEach(member => {
                doc.fontSize(14).text(`${member.firstName} ${member.lastName}`, { underline: true });
                doc.fontSize(10);
                doc.text(`ID: ${member.id}`);
                if (member.dob) doc.text(`DOB: ${new Date(member.dob).toISOString().split('T')[0]}`);
                if (member.contactNumber) doc.text(`Contact: ${member.contactNumber}`);
                if (member.nativePlace) doc.text(`Native Place: ${member.nativePlace}`);
                if (member.address) doc.text(`Address: ${member.address}`);
                doc.moveDown();
            });

            doc.end();
            return;
        }

        return res.status(400).json({ message: 'Invalid format. Use csv, excel, or pdf.' });

    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ message: 'Export failed' });
    }
};
