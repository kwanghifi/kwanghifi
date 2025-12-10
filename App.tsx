import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Home, 
  List, 
  BarChart3, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Package, 
  DollarSign, 
  TrendingUp,
  Filter
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { SaleItem, EquipmentType } from './types';
import { loadSales, saveSales } from './services/storage';
import { StatsCard } from './components/StatsCard';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

enum View {
  DASHBOARD = 'dashboard',
  LIST = 'list',
  FORM = 'form'
}

const App: React.FC = () => {
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'YYYY-MM' or 'all'

  // Form State
  const [formData, setFormData] = useState<Partial<SaleItem>>({
    brand: '',
    type: EquipmentType.SPEAKER,
    model: '',
    costPrice: 0,
    shippingCost: 0,
    sellingPrice: 0,
    date: new Date().toISOString().split('T')[0]
  });

  // Load data on mount
  useEffect(() => {
    const loaded = loadSales();
    setSales(loaded);
  }, []);

  // Save data on change
  useEffect(() => {
    saveSales(sales);
  }, [sales]);

  // Derived State: Filtered Sales
  const filteredSales = useMemo(() => {
    if (selectedMonth === 'all') return sales;
    return sales.filter(s => s.date.startsWith(selectedMonth));
  }, [sales, selectedMonth]);

  // Derived State: Statistics
  const stats = useMemo(() => {
    return filteredSales.reduce((acc, curr) => {
      const cost = Number(curr.costPrice) + Number(curr.shippingCost);
      const revenue = Number(curr.sellingPrice);
      const profit = revenue - cost;

      return {
        totalCost: acc.totalCost + cost,
        totalRevenue: acc.totalRevenue + revenue,
        totalProfit: acc.totalProfit + profit,
        count: acc.count + 1
      };
    }, { totalCost: 0, totalRevenue: 0, totalProfit: 0, count: 0 });
  }, [filteredSales]);

  // Derived State: Category Data for Chart
  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredSales.forEach(sale => {
      if (data[sale.type]) {
        data[sale.type]++;
      } else {
        data[sale.type] = 1;
      }
    });
    return Object.keys(data).map(key => ({ name: key, value: data[key] }));
  }, [filteredSales]);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Price') || name.includes('Cost') ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand || !formData.model) return;

    if (editingId) {
      setSales(prev => prev.map(item => item.id === editingId ? { ...formData, id: editingId } as SaleItem : item));
    } else {
      const newItem: SaleItem = {
        ...formData as SaleItem,
        id: crypto.randomUUID(),
      };
      setSales(prev => [newItem, ...prev]);
    }

    resetForm();
    setCurrentView(View.LIST);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('ยืนยันการลบรายการนี้?')) {
      setSales(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleEdit = (item: SaleItem) => {
    setFormData(item);
    setEditingId(item.id);
    setCurrentView(View.FORM);
  };

  const resetForm = () => {
    setFormData({
      brand: '',
      type: EquipmentType.SPEAKER,
      model: '',
      costPrice: 0,
      shippingCost: 0,
      sellingPrice: 0,
      date: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(amount);
  };

  // Unique months for filter dropdown
  const availableMonths = useMemo(() => {
    const months = new Set(sales.map(s => s.date.substring(0, 7)));
    return Array.from(months).sort().reverse();
  }, [sales]);

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-50 pb-20 relative shadow-2xl overflow-hidden">
      
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">AudioSale Pro</h1>
            <p className="text-indigo-200 text-xs">จัดการยอดขายเครื่องเสียงมือสอง</p>
          </div>
          <div className="bg-indigo-500 rounded-lg p-1">
             <Package size={20} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-y-auto no-scrollbar">
        
        {/* VIEW: DASHBOARD */}
        {currentView === View.DASHBOARD && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Month Filter */}
            <div className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between">
              <div className="flex items-center text-gray-600 gap-2">
                <Filter size={18} />
                <span className="text-sm font-medium">ช่วงเวลา:</span>
              </div>
              <select 
                className="bg-gray-100 border-none rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="all">ทั้งหมด</option>
                {availableMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatsCard 
                title="ยอดขายรวม" 
                value={formatCurrency(stats.totalRevenue)} 
                colorClass="border-blue-500 text-blue-600"
                icon={<DollarSign size={20} className="text-blue-400"/>}
              />
              <StatsCard 
                title="กำไรสุทธิ" 
                value={formatCurrency(stats.totalProfit)} 
                colorClass="border-green-500 text-green-600"
                icon={<TrendingUp size={20} className="text-green-400"/>}
              />
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-700">ต้นทุนรวม</h3>
                  <span className="text-red-500 font-semibold">{formatCurrency(stats.totalCost)}</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
               </div>
               <p className="text-xs text-gray-400 mt-2 text-right">รวมค่าของ + ค่าส่ง</p>
            </div>

            {/* Charts */}
            <div className="bg-white p-4 rounded-xl shadow-sm min-h-[300px]">
              <h3 className="font-bold text-gray-700 mb-4 text-center">สินค้าขายดีแยกตามประเภท</h3>
              {categoryData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => [`${value} ชิ้น`, 'จำนวน']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  ไม่มีข้อมูลการขาย
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: LIST */}
        {currentView === View.LIST && (
          <div className="space-y-3 animate-in fade-in duration-300">
             <div className="flex justify-between items-center mb-2">
               <h2 className="font-bold text-gray-700 text-lg">รายการขาย ({filteredSales.length})</h2>
             </div>
            
            {filteredSales.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Package size={48} className="mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีรายการขาย</p>
                <button 
                  onClick={() => { resetForm(); setCurrentView(View.FORM); }}
                  className="mt-4 text-indigo-600 font-medium hover:underline"
                >
                  + เพิ่มรายการแรก
                </button>
              </div>
            ) : (
              filteredSales.map((item) => {
                const profit = item.sellingPrice - (item.costPrice + item.shippingCost);
                const isProfitPositive = profit > 0;
                
                return (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                          {item.type}
                        </span>
                        <h3 className="font-bold text-gray-800 text-lg mt-1">{item.brand} {item.model}</h3>
                        <p className="text-gray-400 text-xs">{item.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-50 rounded-full text-red-500 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mt-1 bg-gray-50 p-2 rounded-lg">
                       <div>
                         <span className="text-gray-500 text-xs block">ทุนรวม (ของ+ส่ง)</span>
                         <span className="font-medium">{formatCurrency(item.costPrice + item.shippingCost)}</span>
                       </div>
                       <div className="text-right">
                         <span className="text-gray-500 text-xs block">ราคาขาย</span>
                         <span className="font-bold text-indigo-600">{formatCurrency(item.sellingPrice)}</span>
                       </div>
                    </div>

                    <div className="flex justify-between items-center border-t pt-2 mt-1">
                      <span className="text-xs text-gray-500">กำไรสุทธิ</span>
                      <span className={`font-bold ${isProfitPositive ? 'text-green-600' : 'text-red-500'}`}>
                        {isProfitPositive ? '+' : ''}{formatCurrency(profit)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            {/* Spacer for FAB */}
            <div className="h-20"></div>
          </div>
        )}

        {/* VIEW: FORM (Add/Edit) */}
        {currentView === View.FORM && (
          <div className="animate-in slide-in-from-bottom duration-300">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingId ? 'แก้ไขรายการ' : 'เพิ่มรายการขาย'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-xl shadow-sm">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">วันที่ขาย</label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">ประเภท</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {Object.values(EquipmentType).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">ยี่ห้อ (Brand)</label>
                <input
                  type="text"
                  name="brand"
                  placeholder="เช่น Sony, Bose, JBL"
                  required
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">รุ่น (Model)</label>
                <input
                  type="text"
                  name="model"
                  placeholder="ระบุรุ่นสินค้า"
                  required
                  value={formData.model}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">ราคาทุน</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    name="costPrice"
                    min="0"
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">ค่าส่ง/ห่อ</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    name="shippingCost"
                    min="0"
                    value={formData.shippingCost}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-sm font-medium text-gray-700">ราคาขายจริง</label>
                <input
                  type="number"
                  inputMode="numeric"
                  name="sellingPrice"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  className="w-full p-3 border-2 border-green-400 bg-green-50 rounded-lg text-lg font-bold text-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              {/* Profit Preview */}
              <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center text-sm">
                 <span>กำไรโดยประมาณ:</span>
                 <span className={`font-bold text-lg ${(formData.sellingPrice! - (formData.costPrice! + formData.shippingCost!)) > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    {formatCurrency(formData.sellingPrice! - (formData.costPrice! + formData.shippingCost!))}
                 </span>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { resetForm(); setCurrentView(View.LIST); }}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <X size={20} /> ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <Save size={20} /> บันทึก
                </button>
              </div>

            </form>
          </div>
        )}
      </main>

      {/* Floating Action Button for ADD (only on Dashboard or List) */}
      {currentView !== View.FORM && (
        <button
          onClick={() => { resetForm(); setCurrentView(View.FORM); }}
          className="absolute bottom-20 right-4 w-14 h-14 bg-indigo-600 rounded-full shadow-xl flex items-center justify-center text-white hover:bg-indigo-700 active:scale-90 transition-transform z-20"
        >
          <Plus size={28} />
        </button>
      )}

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full max-w-md pb-safe z-30">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setCurrentView(View.DASHBOARD)}
            className={`flex flex-col items-center justify-center w-full h-full ${currentView === View.DASHBOARD ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <Home size={currentView === View.DASHBOARD ? 24 : 22} strokeWidth={currentView === View.DASHBOARD ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-medium">ภาพรวม</span>
          </button>
          
          <button
            onClick={() => setCurrentView(View.LIST)}
            className={`flex flex-col items-center justify-center w-full h-full ${currentView === View.LIST ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <List size={currentView === View.LIST ? 24 : 22} strokeWidth={currentView === View.LIST ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-medium">รายการ</span>
          </button>
        </div>
      </nav>
      
    </div>
  );
};

export default App;