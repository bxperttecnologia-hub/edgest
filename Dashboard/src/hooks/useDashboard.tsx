import React, { useEffect, useState } from "react";
import { getDashboard } from "@/services/dashboardService";

export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const result = await getDashboard();
    setData(result);
    setLoading(false);
  }

  return { data, loading, reload: load };
}
