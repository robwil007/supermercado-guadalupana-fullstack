import React, { useState, useMemo } from 'react';
import {
    XIcon, LoaderIcon, CashIcon, CardIcon, QRIcon
} from './icons/InterfaceIcons';

interface PaymentModalProps {
    total: number;
    onClose: () => void;
    onFinalize: (paymentMethod: 'cash' | 'card' | 'qr') => Promise<void>;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ total, onClose, onFinalize }) => {
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qr' | null>(null);
    const [amountPaid, setAmountPaid] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const change = useMemo(() => {
        const paid = parseFloat(amountPaid);
        if (!isNaN(paid) && paid >= total) return paid - total;
        return 0;
    }, [amountPaid, total]);

    const handleFinalize = async () => {
        if (!paymentMethod) return;
        setIsProcessing(true);
        try {
            await onFinalize(paymentMethod);
            // The parent component will handle showing the completion screen.
        } catch (error) {
            console.error("Failed to finalize payment", error);
            alert("Hubo un error al procesar el pago.");
            setIsProcessing(false);
        }
    };
    
    const getDenominationButtons = () => {
        if (total <= 0) return [10, 20, 50, 100];
        if (total <= 10) return [10, 20, 50, 100];
        if (total <= 20) return [20, 50, 100];
        if (total <= 50) return [50, 100, 200];
        if (total <= 100) return [100, 200];
        return [200];
    }
    
    return (
        <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col animate-fade-in-up">
                <header className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Pagar</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon /></button>
                </header>
                <div className="p-8 text-center">
                    <p className="text-gray-500 text-lg">Total a Pagar</p>
                    <p className="text-6xl font-bold text-gray-800 my-4">Bs. {total.toFixed(2)}</p>

                    {!paymentMethod ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <button onClick={() => setPaymentMethod('cash')} className="flex flex-col items-center justify-center gap-2 p-6 bg-gray-100 hover:bg-blue-100 hover:border-blue-500 border-2 border-transparent rounded-xl transition-colors">
                                <CashIcon className="w-12 h-12 text-gray-700" />
                                <span className="text-xl font-semibold">Efectivo</span>
                            </button>
                            <button onClick={() => setPaymentMethod('card')} className="flex flex-col items-center justify-center gap-2 p-6 bg-gray-100 hover:bg-blue-100 hover:border-blue-500 border-2 border-transparent rounded-xl transition-colors">
                                <CardIcon className="w-12 h-12 text-gray-700" />
                                <span className="text-xl font-semibold">Tarjeta</span>
                            </button>
                            <button onClick={() => setPaymentMethod('qr')} className="flex flex-col items-center justify-center gap-2 p-6 bg-gray-100 hover:bg-blue-100 hover:border-blue-500 border-2 border-transparent rounded-xl transition-colors">
                                <QRIcon className="w-12 h-12 text-gray-700" />
                                <span className="text-xl font-semibold">Pago con QR</span>
                            </button>
                        </div>
                    ) : paymentMethod === 'cash' ? (
                        <div className="animate-fade-in-up">
                            <div className="flex justify-center gap-2 my-4">
                               <button onClick={() => setAmountPaid(total.toFixed(2))} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold">Monto Exacto</button>
                               {getDenominationButtons().map(d => <button key={d} onClick={() => setAmountPaid(d.toString())} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold">Bs. {d}</button>)}
                            </div>
                            <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="Monto recibido" className="w-full text-center text-2xl p-4 border-2 rounded-lg" autoFocus/>
                            <p className="text-lg mt-4">Cambio a devolver: <span className="font-bold text-2xl text-green-600">Bs. {change.toFixed(2)}</span></p>
                            <button onClick={handleFinalize} disabled={isProcessing || parseFloat(amountPaid) < total} className="mt-6 w-full bg-green-500 text-white font-bold text-2xl py-4 rounded-xl disabled:bg-gray-300">
                                {isProcessing ? <LoaderIcon /> : 'Confirmar Pago'}
                            </button>
                        </div>
                    ) : (
                         <div className="animate-fade-in-up">
                            {paymentMethod === 'card' && <p className="text-xl text-gray-600 mt-6">Por favor, inserte/acerque su tarjeta en la terminal de pago.</p>}
                            {paymentMethod === 'qr' && <p className="text-xl text-gray-600 mt-6">Por favor, escanee el código QR para realizar el pago.</p>}
                            <div className="my-8">
                                {paymentMethod === 'card' 
                                    ? <LoaderIcon className="text-blue-500 h-16 w-16 mx-auto" />
                                    : <div className="flex justify-center">
                                        <img 
                                            src="https://i.ibb.co/6rWd050/qr-placeholder.png" 
                                            alt="Código QR de pago" 
                                            className="w-64 h-64 border-4 border-gray-300 rounded-lg p-2 bg-white" 
                                        />
                                    </div>
                                }
                            </div>
                            <p className="text-sm text-gray-500">Aguardando confirmación de pago...</p>
                            <button onClick={handleFinalize} disabled={isProcessing} className="mt-6 w-full bg-green-500 text-white font-bold text-2xl py-4 rounded-xl disabled:bg-gray-300">
                                {isProcessing ? 'Procesando...' : 'Completar Pago'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;