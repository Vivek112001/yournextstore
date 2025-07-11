'use client'
import { useEffect, useState } from 'react';
import { Product } from '../models/product';

type UseProductsResult = {
  data: Product[] | null;
  loading: boolean;
  error: string | null;
};

export const useProducts = (): UseProductsResult => {
  const [data, setData] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://fakestoreapi.com/products');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = (await response.json()) as Product[];
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { data, loading, error };
};
