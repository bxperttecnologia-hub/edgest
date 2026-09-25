import { useEffect, useState } from "react";
import {
  getFinancialReports,
  getAcademicReports,
  getEnrollmentReports,
  getOperationalReports,
} from "@/services/reportService";

export function useReports() {
  const [data, setData] = useState<any>({
    financial: null,
    academic: null,
    enrollment: null,
    operational: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const [
        financial,
        academic,
        enrollment,
        operational,
      ] = await Promise.all([
        getFinancialReports(),
        getAcademicReports(),
        getEnrollmentReports(),
        getOperationalReports(),
      ]);

      setData({
        financial,
        academic,
        enrollment,
        operational,
      });
    } catch (err: any) {
      console.error(err);
      setError("Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchReports,
  };
}