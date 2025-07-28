import jsPDF from 'jspdf';

export interface PDFAnalysisData {
  companyName: string;
  companyNumber: string;
  filingType: string;
  filingDate: string;
  summary: string;
  keyInsights: string[];
}

export function generateAnalysisPDF(data: PDFAnalysisData): void {
  const doc = new jsPDF();
  
  // Set up styling
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('UK Company Financial Analysis', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;
  
  // Company Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Company Details', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Company Name: ${data.companyName}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Company Number: ${data.companyNumber}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Filing Type: ${data.filingType}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Filing Date: ${data.filingDate}`, margin, yPosition);
  yPosition += 15;
  
  // Summary Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // Split summary into lines that fit the page width
  const summaryLines = doc.splitTextToSize(data.summary, contentWidth);
  doc.text(summaryLines, margin, yPosition);
  yPosition += (summaryLines.length * 5) + 10;
  
  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = margin;
  }
  
  // Key Insights Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Insights', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
      data.keyInsights.forEach((insight) => {
    const bulletPoint = `• ${insight}`;
    const insightLines = doc.splitTextToSize(bulletPoint, contentWidth);
    doc.text(insightLines, margin, yPosition);
    yPosition += (insightLines.length * 5) + 3;
    
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margin;
    }
  });
  
  yPosition += 15;
  
  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  const footerText = `Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`;
  doc.text(footerText, pageWidth / 2, yPosition, { align: 'center' });
  
  // Generate filename
  const filename = `${data.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${data.filingType}_${data.filingDate}_analysis.pdf`;
  
  // Save the PDF
  doc.save(filename);
}

 