/**
 * Export Button Component for Analytics
 * 
 * Provides an interface for exporting analytics data in CSV format
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCSV } from "@/lib/csv-export";
import { exportAnalyticsToPDF } from "@/lib/pdf-export";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonProps {
  /**
   * The data to export
   */
  data: any[];
  
  /**
   * The type of data (used for filename)
   */
  dataType: string;
  
  /**
   * Additional label to append to filename
   */
  periodLabel?: string;
  
  /**
   * Optional column definitions for CSV export
   */
  columns?: { key: string; header: string }[];
  
  /**
   * Optional variant for the button
   */
  variant?: "default" | "outline" | "ghost";
  
  /**
   * Optional size for the button
   */
  size?: "default" | "sm" | "lg" | "icon";
  
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Export Button component for downloading analytics data
 */
export function ExportButton({
  data,
  dataType,
  periodLabel = "",
  columns,
  variant = "outline",
  size = "sm",
  className = "",
}: ExportButtonProps) {
  // Format current date for filename
  const formattedDate = new Date().toISOString().split('T')[0];
  
  /**
   * Handles export to CSV format
   */
  const handleExportCSV = () => {
    const periodSuffix = periodLabel ? `_${periodLabel}` : "";
    const filename = `${dataType}_analytics${periodSuffix}_${formattedDate}`;
    
    exportToCSV(data, filename, columns);
  };

  /**
   * Handles export to PDF format
   */
  const handleExportPDF = () => {
    // Call the PDF export utility with the data and type
    exportAnalyticsToPDF(dataType, data, periodLabel);
  };
  
  /**
   * Placeholder for additional export formats (like Excel)
   * To be implemented in future sprints
   */
  const handleExportOtherFormats = (format: string) => {
    console.log(`Export to ${format} not yet implemented`);
    // This would integrate with libraries like xlsx in the future
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          Export to CSV
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleExportPDF}
        >
          Export to PDF
        </DropdownMenuItem>
        {/* Future export options could be added here */}
        <DropdownMenuItem 
          onClick={() => handleExportOtherFormats("excel")}
          disabled={true}
        >
          Export to Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 