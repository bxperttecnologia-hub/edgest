import {
  exportFinancialReport,
  exportAcademicReport,
  exportEnrollmentReport,
  exportOperationalReport,
} from "@/services/reportService";

export function useExportReport() {
  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const exportMap: Record<string, any> = {
    financial: exportFinancialReport,
    academic: exportAcademicReport,
    enrollment: exportEnrollmentReport,
    operational: exportOperationalReport,
  };

  const exportReport = async (type: string) => {
    try {
      const fn = exportMap[type];

      if (!fn) throw new Error("Tipo inválido");

      const blob = await fn();

      downloadFile(blob, `relatorio_${type}.xlsx`);
    } catch (err) {
      console.error(err);
    }
  };

  return { exportReport };
}