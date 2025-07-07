import React, { useState, useEffect, useMemo } from 'react';
import * as posSyncService from '../api/posSyncService';
import { XIcon, LoaderIcon } from './icons/InterfaceIcons';

interface CloseDayModalProps {
    onClose: () => void;
}

interface ReportData {
    totalSales: number;
    salesCount: number;
    byPaymentMethod: {
        cash: number;
        card: number;
        qr: number;
    };
}

const CloseDayModal: React.FC<CloseDayModalProps> = ({ onClose }) => {
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const generateReport = async () => {
            try {
                setLoading(true);
                const sales = await posSyncService.getQueuedSales();
                
                const initialReport: ReportData = {
                    totalSales: 0,
                    salesCount: sales.length,
                    byPaymentMethod: { cash: 0, card: 0, qr: 0 }
                };

                const calculatedReport = sales.reduce((acc, sale) => {
                    acc.totalSales += sale.total;
                    acc.byPaymentMethod[sale.paymentMethod] += sale.total;
                    return acc;
                }, initialReport);

                setReport(calculatedReport);
            } catch (err) {
                setError("No se pudo generar el reporte.");
            } finally {
                setLoading(false);
            }
        };

        generateReport();
    }, []);

    const handleSyncAndClose = async () => {
        setIsSyncing(true);
        setError(null);
        const success = await posSyncService.syncQueuedSales();
        if(success) {
            // After successful sync, clear the local sales for the next shift
            await posSyncService.clearLocalSales();
            alert("Turno cerrado y ventas sincronizadas con éxito.");
            onClose();
        } else {
            setError("Fallo la sincronización. Verifica tu conexión a internet. Tus ventas no se han perdido y se reintentará más tarde.");
        }
        setIsSyncing(false);
    };

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center h-48"><LoaderIcon className="text-primary" /></div>;
        }
        if (error) {
            return <div className="text-center text-red-500 p-6">{error}</div>;
        }
        if (!report) {
            return <div className="text-center text-gray-500 p-6">No hay datos de ventas para este turno.</div>;
        }

        return (
            <div className="p-6 space-y-4">
                <div className="text-center">
                    <p className="text-lg text-gray-600">Total Ventas del Turno</p>
                    <p className="text-4xl font-bold text-gray-800">Bs. {report.totalSales.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{report.salesCount} transacciones</p>
                </div>
                <div className="pt-4 border-t">
                    <h4 className="font-semibold text-lg mb-2">Desglose por Método de Pago</h4>
                    <div className="space-y-2 text-base">
                        <div className="flex justify-between">
                            <span className="text-gray-700">Efectivo</span>
                            <span className="font-medium">Bs. {report.byPaymentMethod.cash.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">Tarjeta</span>
                            <span className="font-medium">Bs. {report.byPaymentMethod.card.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-gray-700">QR</span>
                            <span className="font-medium">Bs. {report.byPaymentMethod.qr.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-fade-in-up">
                <header className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Cierre de Turno</h2>
                    <button onClick={onClose} disabled={isSyncing} className="p-1 rounded-full hover:bg-gray-200"><XIcon /></button>
                </header>
                {renderContent()}
                <footer className="p-4 bg-gray-50 border-t">
                    <button 
                        onClick={handleSyncAndClose} 
                        disabled={isSyncing || loading || !report || report.salesCount === 0}
                        className="w-full py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold disabled:bg-gray-400 flex justify-center items-center"
                    >
                        {isSyncing ? <LoaderIcon /> : 'Cerrar Turno y Sincronizar'}
                    </button>
                    {error && <p className="text-xs text-center text-red-600 mt-2">{error}</p>}
                </footer>
            </div>
        </div>
    );
};

export default CloseDayModal;