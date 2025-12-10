export enum EquipmentType {
  SPEAKER = 'ลำโพง',
  AMPLIFIER = 'แอมป์',
  PLAYER = 'เครื่องเล่น/DAC',
  CABLE = 'สายสัญญาณ',
  ACCESSORY = 'อุปกรณ์เสริม',
  OTHER = 'อื่นๆ'
}

export interface SaleItem {
  id: string;
  brand: string;
  type: EquipmentType | string;
  model: string;
  costPrice: number;
  shippingCost: number;
  sellingPrice: number;
  date: string; // ISO String
  note?: string;
}

export interface SummaryStats {
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  count: number;
}