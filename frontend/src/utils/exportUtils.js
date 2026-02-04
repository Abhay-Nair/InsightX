// Export utilities for analytics reports and charts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

export const exportToPDF = async (elementId, filename = 'analytics-report') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add title page
    pdf.setFontSize(20);
    pdf.text('InsightX Analytics Report', 20, 30);
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
    
    if (heightLeft < pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 50, imgWidth, imgHeight);
    } else {
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to export PDF');
  }
};

export const exportToExcel = (data, filename = 'analytics-data') => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    if (data.summary) {
      const summaryData = [
        ['Dataset Information'],
        ['Filename', data.summary.filename || 'N/A'],
        ['Total Rows', data.summary.total_rows || 0],
        ['Total Columns', data.summary.total_columns || 0],
        ['Analysis Date', new Date(data.summary.analysis_timestamp).toLocaleDateString()],
        [''],
        ['Data Quality'],
        ['Health Score', data.health?.score || 'N/A'],
        ['Missing Data %', data.health?.missing_percentage || 'N/A'],
        ['Duplicates', data.health?.duplicates || 'N/A']
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }

    // Statistics sheet
    if (data.statistics) {
      const statsData = [['Column', 'Mean', 'Median', 'Min', 'Max', 'Std Dev']];
      Object.entries(data.statistics).forEach(([col, stats]) => {
        statsData.push([
          col,
          stats.mean || 'N/A',
          stats.median || 'N/A',
          stats.min || 'N/A',
          stats.max || 'N/A',
          stats.std || 'N/A'
        ]);
      });
      
      const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');
    }

    // Categorical analysis sheet
    if (data.categorical) {
      const catData = [['Column', 'Unique Values', 'Top Value', 'Count', 'Percentage']];
      Object.entries(data.categorical).forEach(([col, cat]) => {
        const topValue = cat.top_values_detailed?.[0];
        catData.push([
          col,
          cat.unique_values || 'N/A',
          topValue?.value || 'N/A',
          topValue?.count || 'N/A',
          topValue?.percentage ? `${topValue.percentage}%` : 'N/A'
        ]);
      });
      
      const catSheet = XLSX.utils.aoa_to_sheet(catData);
      XLSX.utils.book_append_sheet(workbook, catSheet, 'Categorical Analysis');
    }

    XLSX.writeFile(workbook, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Excel export failed:', error);
    throw new Error('Failed to export Excel file');
  }
};

export const exportToCSV = (data, filename = 'analytics-summary') => {
  try {
    let csvContent = 'InsightX Analytics Report\n';
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

    // Summary section
    if (data.summary) {
      csvContent += 'DATASET SUMMARY\n';
      csvContent += `Filename,${data.summary.filename || 'N/A'}\n`;
      csvContent += `Total Rows,${data.summary.total_rows || 0}\n`;
      csvContent += `Total Columns,${data.summary.total_columns || 0}\n\n`;
    }

    // Statistics section
    if (data.statistics) {
      csvContent += 'STATISTICAL ANALYSIS\n';
      csvContent += 'Column,Mean,Median,Min,Max,Standard Deviation\n';
      Object.entries(data.statistics).forEach(([col, stats]) => {
        csvContent += `${col},${stats.mean || 'N/A'},${stats.median || 'N/A'},${stats.min || 'N/A'},${stats.max || 'N/A'},${stats.std || 'N/A'}\n`;
      });
      csvContent += '\n';
    }

    // Data quality section
    if (data.health) {
      csvContent += 'DATA QUALITY\n';
      csvContent += `Health Score,${data.health.score || 'N/A'}\n`;
      csvContent += `Missing Data Percentage,${data.health.missing_percentage || 'N/A'}\n`;
      csvContent += `Duplicate Rows,${data.health.duplicates || 'N/A'}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('CSV export failed:', error);
    throw new Error('Failed to export CSV file');
  }
};

export const exportChartAsImage = async (chartRef, filename = 'chart') => {
  try {
    if (!chartRef.current) {
      throw new Error('Chart reference not found');
    }

    const canvas = chartRef.current.canvas;
    const url = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = url;
    link.click();
    
    return true;
  } catch (error) {
    console.error('Chart export failed:', error);
    throw new Error('Failed to export chart');
  }
};