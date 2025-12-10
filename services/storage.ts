import { SaleItem } from '../types';

const STORAGE_KEY = 'audio_sales_data_v1';

export const saveSales = (sales: SaleItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
  } catch (error) {
    console.error("Error saving to local storage", error);
  }
};

export const loadSales = (): SaleItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading from local storage", error);
    return [];
  }
};