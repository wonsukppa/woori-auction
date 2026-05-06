import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateAuctionReport = async (elementId: string, caseNo: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Show the hidden element temporarily for capture
  const originalStyle = element.style.display;
  element.style.display = 'block';

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High DPI
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pageWidth;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;

    // If image is taller than page, scale it down to fit perfectly on one page
    if (imgHeight > pageHeight) {
      const ratio = pageHeight / imgHeight;
      imgHeight = pageHeight;
      // We keep the width as pageWidth, as jsPDF handles the scaling
    }

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`우리옥션_AI리포트_${caseNo}.pdf`);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  } finally {
    element.style.display = originalStyle;
  }
};
