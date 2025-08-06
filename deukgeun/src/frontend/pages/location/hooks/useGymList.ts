// src/features/gym/hooks/useGymList.ts

import { useEffect, useState } from "react";
import { getGyms } from "../API/getGyms";
import { Gym } from "../types";

export const useGymList = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const data = await getGyms();
        setGyms(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchGyms();
  }, []);

  return { gyms, loading, error };
};
