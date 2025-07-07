import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/AppContext';
import { ExpenseCategory, Expense, Return, StockMovement } from '../types';
import * as financialService from '../api/financialService';
import { DollarSignIcon, PlusIcon, TrendingUpIcon, TrendingDownIcon, LoaderIcon, XIcon, UndoIcon, WarningIcon } from './icons/InterfaceIcons';

// =============================================
// KPI Card Component
// =============================================
interface KpiCardProps {
    title: string;
    value: string;
    change?: number;
    icon: React.ReactNode;
    colorClass: string;
}
const KpiCard: React.FC<KpiCardProps> = ({ title, value, change, icon, colorClass }) => (
    <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center">
            <div className={`p-3 rounded-full ${colorClass}`}>
                {icon}
            </div>
            {change !== undefined && (
                <span className={`ml-auto font-semibold text-sm flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {change >= 0 ? <TrendingUpIcon className="w-4 h-4"/> : <TrendingDownIcon className="w-4 h-4"/>}
                    {change.toFixed(1)}%
                </span>
            )}
        </div>
        <p className="mt-4 text-3xl font-semibold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
    </div>
);


// =============================================
// Add Expense Modal Component
// =============================================
const AddExpenseModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addExpense } = useData();
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>('Otros');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0 || !description) {
            alert("Por favor, complete todos los campos correctamente.");
            return;
        }
        setLoading(true);
        await addExpense({ amount: numAmount, category, description });
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                 <header className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold">Registrar Gasto Operativo</h3>
                    <button onClick={onClose}><XIcon /></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Monto (Bs.)</label>
                            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full mt-1 p-2 border rounded-lg" required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Categoría</label>
                            <select value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="w-full mt-1 p-2 border rounded-lg bg-white" required>
                                <option>Salarios</option><option>Alquiler</option><option>Servicios</option>
                                <option>Marketing</option><option>Suministros</option><option>Impuestos</option>
                                <option>Otros</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Descripción</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full mt-1 p-2 border rounded-lg" required/>
                        </div>
                    </div>
                    <footer className="p-4 bg-gray-50 border-t">
                        <button type="submit" disabled={loading} className="w-full py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark disabled:bg-gray-400">
                             {loading ? <LoaderIcon /> : "Guardar Gasto"}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};


// =============================================
// Main Financial Center Component
// =============================================
const FinancialCenter: React.FC = () => {
    const { 
        orders, expenses, returns, stockMovements, allProducts,
        addExpense, makeStockAdjustment, createReturn, fetchAllData
    } = useData();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'returns' | 'mermas'>('dashboard');
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [summary, setSummary] = useState<financialService.FinancialSummary | null>(null);
    const [spoilage, setSpoilage] = useState<financialService.SpoilageReport | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            const [summaryData, spoilageData] = await Promise.all([
                financialService.getFinancialSummary(orders, expenses),
                financialService.getSpoilageReport(stockMovements, allProducts)
            ]);
            setSummary(summaryData);
            setSpoilage(spoilageData);
        }
        fetchReports();
    }, [orders, expenses, stockMovements, allProducts]);

    const handleGenerateSampleData = async () => {
        setIsGenerating(true);
        try {
            await addExpense({ amount: 1250.75, category: 'Alquiler', description: 'Alquiler de local (Generado)' });
            const productForSpoilage = allProducts.find(p => p.id === 'P009'); // Detergente OLA
            if (productForSpoilage) {
                await makeStockAdjustment(productForSpoilage.id, 2, 'Producto Dañado (Generado)');
            }
            const lastOrder = orders.find(o => o.channel === 'Online');
            if (lastOrder && lastOrder.items.length > 0) {
                const itemToReturn = lastOrder.items[0];
                await createReturn({
                    orderId: lastOrder.id,
                    returnedItems: [{ ...itemToReturn, quantity: 1 }],
                    reason: 'No le gustó al cliente (Generado)',
                    restocked: false,
                    refundAmount: itemToReturn.price,
                    channel: lastOrder.channel
                });
            } else {
                 console.log("No online order found to create a sample return.");
            }
            await fetchAllData(); // Refetch all data to update context state for next render
            alert("Datos de ejemplo generados. Los reportes se han actualizado.");
        } catch (e) {
            console.error("Error generating sample data", e);
            alert("Hubo un error al generar los datos de ejemplo.");
        } finally {
            setIsGenerating(false);
        }
    };


    const renderContent = () => {
        if (!summary || !spoilage) {
            return <div className="flex justify-center items-center h-64"><LoaderIcon className="text-primary w-8 h-8"/></div>;
        }

        switch (activeTab) {
            case 'dashboard':
                return (
                     <div className="space-y-6">
                        <div className="p-4 bg-blue-50 border border-dashed border-blue-300 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-blue-800">Herramienta de Demostración</h4>
                                    <p className="text-sm text-blue-700">¿Reportes vacíos? Genera datos de ejemplo para ver los reportes en acción.</p>
                                </div>
                                <button onClick={handleGenerateSampleData} disabled={isGenerating} className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center w-48">
                                    {isGenerating ? <LoaderIcon /> : 'Generar Datos'}
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                             <KpiCard title="Ingresos Totales" value={`Bs. ${summary.totalRevenue.toLocaleString('es-ES', { maximumFractionDigits: 2})}`} icon={<TrendingUpIcon />} colorClass="bg-green-100 text-green-600" />
                             <KpiCard title="Costo de Mercadería" value={`Bs. ${summary.totalCostOfGoods.toLocaleString('es-ES', { maximumFractionDigits: 2})}`} icon={<DollarSignIcon />} colorClass="bg-orange-100 text-orange-600" />
                             <KpiCard title="Ganancia Bruta" value={`Bs. ${summary.grossProfit.toLocaleString('es-ES', { maximumFractionDigits: 2})}`} icon={<TrendingUpIcon />} colorClass="bg-blue-100 text-blue-600" />
                             <KpiCard title="Gastos Operativos" value={`Bs. ${summary.totalExpenses.toLocaleString('es-ES', { maximumFractionDigits: 2})}`} icon={<TrendingDownIcon />} colorClass="bg-red-100 text-red-600" />
                             <KpiCard title="Ganancia Neta" value={`Bs. ${summary.netProfit.toLocaleString('es-ES', { maximumFractionDigits: 2})}`} icon={<DollarSignIcon />} colorClass="bg-purple-100 text-purple-600" />
                        </div>
                     </div>
                );
            case 'expenses':
                return (
                    <div className="bg-white rounded-xl shadow-md">
                        <header className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg">Historial de Gastos</h3>
                             <button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold"><PlusIcon /> Registrar Gasto</button>
                        </header>
                         <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50"><tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Categoría</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Descripción</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Monto</th>
                            </tr></thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {expenses.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-10 text-gray-500">No hay gastos registrados.</td></tr>
                                ) : (
                                    expenses.map(e => (
                                        <tr key={e.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(e.date).toLocaleDateString('es-ES')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{e.category}</span></td>
                                            <td className="px-6 py-4 text-sm">{e.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-red-600">Bs. {e.amount.toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                         </table>
                    </div>
                );
            case 'returns':
                 return (
                    <div className="bg-white rounded-xl shadow-md">
                         <header className="p-4 border-b"><h3 className="font-bold text-lg">Historial de Devoluciones</h3></header>
                         <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50"><tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">ID Venta Original</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Artículos</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Reingresado a Stock</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Monto Devuelto</th>
                            </tr></thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {returns.length === 0 ? (
                                     <tr><td colSpan={5} className="text-center py-10 text-gray-500">No hay devoluciones registradas.</td></tr>
                                ) : (
                                    returns.map(r => (
                                        <tr key={r.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(r.date).toLocaleDateString('es-ES')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{r.orderId.slice(-8)}</td>
                                            <td className="px-6 py-4 text-sm">{r.returnedItems.map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
                                            <td className="px-6 py-4 text-sm">{r.restocked ? 'Sí' : 'No'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-orange-600">Bs. {r.refundAmount.toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                         </table>
                    </div>
                );
             case 'mermas':
                return (
                     <div className="bg-white rounded-xl shadow-md">
                         <header className="p-4 border-b flex items-center gap-2">
                             <WarningIcon className="text-red-500 h-6 w-6"/>
                             <h3 className="font-bold text-lg">Reporte de Mermas (Pérdidas de Inventario)</h3>
                         </header>
                         <div className="p-4 bg-red-50 text-red-800 font-bold text-lg">Costo Total de Mermas: Bs. {spoilage.totalSpoilageCost.toFixed(2)}</div>
                         <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50"><tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Producto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Razón</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">Cantidad</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Costo de Pérdida</th>
                            </tr></thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {spoilage.spoilageDetails.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-10 text-gray-500">No se han registrado mermas.</td></tr>
                                ) : (
                                    spoilage.spoilageDetails.map(m => (
                                        <tr key={m.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(m.date).toLocaleDateString('es-ES')}</td>
                                            <td className="px-6 py-4 text-sm">{m.productName}</td>
                                            <td className="px-6 py-4 text-sm">{m.reason}</td>
                                            <td className="px-6 py-4 text-center font-bold text-red-600">{m.quantity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-red-600">Bs. {m.cost.toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                         </table>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div>
            {isExpenseModalOpen && <AddExpenseModal onClose={() => setIsExpenseModalOpen(false)} />}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 py-3 px-1 text-base font-semibold transition-colors ${activeTab === 'dashboard' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-800'}`}><TrendingUpIcon /> Dashboard</button>
                    <button onClick={() => setActiveTab('expenses')} className={`flex items-center gap-2 py-3 px-1 text-base font-semibold transition-colors ${activeTab === 'expenses' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-800'}`}><DollarSignIcon /> Gastos</button>
                    <button onClick={() => setActiveTab('returns')} className={`flex items-center gap-2 py-3 px-1 text-base font-semibold transition-colors ${activeTab === 'returns' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-800'}`}><UndoIcon /> Devoluciones</button>
                    <button onClick={() => setActiveTab('mermas')} className={`flex items-center gap-2 py-3 px-1 text-base font-semibold transition-colors ${activeTab === 'mermas' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-800'}`}><WarningIcon /> Reporte de Mermas</button>
                </nav>
            </div>
            {renderContent()}
        </div>
    );
};

export default FinancialCenter;