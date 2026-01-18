import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to Excel format
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file (without extension)
 * @param {Array} columns - Array of column definitions [{key, header}]
 */
export const exportToExcel = (data, filename, columns) => {
  // Prepare data for Excel
  const excelData = data.map(item => {
    const row = {};
    columns.forEach(col => {
      row[col.header] = col.formatter ? col.formatter(item[col.key]) : (item[col.key] || '');
    });
    return row;
  });

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Set column widths
  const colWidths = columns.map(() => ({ wch: 20 }));
  ws['!cols'] = colWidths;

  // Export file
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

/**
 * Export multiple datasets to Excel with multiple sheets
 * @param {Array} sheets - Array of sheet definitions [{name, data, columns}]
 * @param {String} filename - Name of the file (without extension)
 */
export const exportMultipleToExcel = (sheets, filename) => {
  const wb = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    // Prepare data for Excel
    const excelData = sheet.data.map(item => {
      const row = {};
      sheet.columns.forEach(col => {
        row[col.header] = col.formatter ? col.formatter(item[col.key]) : (item[col.key] || '');
      });
      return row;
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const colWidths = sheet.columns.map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    // Add sheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });

  // Export file
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

/**
 * Export data to PDF format
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file (without extension)
 * @param {String} title - Title for the PDF document
 * @param {Array} columns - Array of column definitions [{key, header, dataKey}]
 */
export const exportToPDF = (data, filename, title, columns) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 15);
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
  doc.setTextColor(0, 0, 0);

  // Prepare table data
  const tableData = data.map(item => 
    columns.map(col => {
      const value = col.formatter ? col.formatter(item[col.key]) : (item[col.key] || '');
      return value;
    })
  );

  const tableHeaders = columns.map(col => col.header);

  // Add table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: 28,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { top: 28 },
  });

  // Save PDF
  doc.save(`${filename}.pdf`);
};

/**
 * Export multiple datasets to PDF with multiple sections
 * @param {Array} sections - Array of section definitions [{title, data, columns}]
 * @param {String} filename - Name of the file (without extension)
 * @param {String} mainTitle - Main title for the PDF document
 */
export const exportMultipleToPDF = (sections, filename, mainTitle = 'Complete Report') => {
  const doc = new jsPDF();
  let startY = 20;
  
  // Add main title
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text(mainTitle, 14, startY);
  startY += 8;
  
  // Add date
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, startY);
  doc.setTextColor(0, 0, 0);
  startY += 10;

  sections.forEach((section, index) => {
    // Add new page if not first section and we're near the bottom
    if (index > 0 && startY > 250) {
      doc.addPage();
      startY = 20;
    }

    // Add section title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text(section.title, 14, startY);
    startY += 8;

    // Prepare table data
    const tableData = section.data.map(item => 
      section.columns.map(col => {
        const value = col.formatter ? col.formatter(item[col.key]) : (item[col.key] || '');
        return String(value || '');
      })
    );

    const tableHeaders = section.columns.map(col => col.header);

    // Add table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: startY,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      margin: { top: startY },
    });

    // Get the final Y position after the table
    startY = doc.lastAutoTable.finalY + 15;
    doc.setTextColor(0, 0, 0);
  });

  // Save PDF
  doc.save(`${filename}.pdf`);
};

/**
 * Format date for export
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString();
};

/**
 * Format boolean for export
 */
export const formatBoolean = (value) => {
  return value ? 'Yes' : 'No';
};

/**
 * Format status for export
 */
export const formatStatus = (status) => {
  if (!status) return 'N/A';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

