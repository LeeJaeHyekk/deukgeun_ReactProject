import { useState, useEffect } from "react";
import { statsApi, PlatformStats } from "../api/statsApi";
import { showToast } from "../lib";

export const useStats = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await statsApi.getPlatformStats();
      setStats(data);
    } catch (err) {
      console.error("통계 조회 오류:", err);
      setError("통계를 불러오는데 실패했습니다.");
      showToast("통계 조회에 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
};
