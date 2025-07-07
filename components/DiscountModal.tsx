import React, { useState } from 'react';
import { XIcon, TagSolidIcon } from './icons/InterfaceIcons';

interface DiscountModalProps {
    onClose: () => void;
    applyPosDiscount: (type: 'percentage' | 'fixed', value: number) => void;
    clearPosDiscount: () => void;
    posDiscount: { type: 'percentage' | 'fixed'; value: number };
}

const DiscountModal: React.FC<DiscountModalProps> = ({ onClose, applyPosDiscount, clearPosDiscount, posDiscount }) => {
    const [type, setType] = useState<'percentage' | 'fixed'>(posDiscount.type);
    const [value, setValue] = useState(posDiscount.value > 0 ? posDiscount.value.toString() : '');
    const [loyaltyCode, setLoyaltyCode] = useState('');

    const handleApply = () => {
        // Mock loyalty code logic
        if (loyaltyCode.toUpperCase() === 'CLIENTEORO') {
            applyPosDiscount('percentage', 15);
            onClose();
            return;
        }

        const numValue = parseFloat(value);
        if (value && !isNaN(numValue) && numValue >= 0) {
            applyPosDiscount(type, numValue);
            onClose();
        } else {
            alert('Por favor, introduce un valor válido.');
        }
    };

    const handleClear = () => {
        clearPosDiscount();
        onClose();
    };

    return (
        <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-fade-in-up">
                <header className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Aplicar Descuento</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon /></button>
                </header>
                <div className="p-6 space-y-6">
                    <div>
                        <label htmlFor="loyalty" className="block text-sm font-medium text-gray-700">Código de Fidelidad</label>
                        <div className="mt-1 flex gap-2">
                            <input
                                id="loyalty"
                                type="text"
                                value={loyaltyCode}
                                onChange={e => setLoyaltyCode(e.target.value)}
                                placeholder="Ej: CLIENTEORO"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            />
                        </div>
                         <p className="text-xs text-gray-500 mt-1">Intenta con el código "CLIENTEORO" para un 15% de descuento.</p>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">O aplicar manualmente</span></div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Descuento</label>
                         <div className="mt-1 grid grid-cols-2 gap-2">
                            <button onClick={() => setType('percentage')} className={`p-3 border rounded-lg font-semibold ${type === 'percentage' ? 'bg-primary/10 border-primary ring-2 ring-primary' : 'border-gray-300'}`}>Porcentaje (%)</button>
                            <button onClick={() => setType('fixed')} className={`p-3 border rounded-lg font-semibold ${type === 'fixed' ? 'bg-primary/10 border-primary ring-2 ring-primary' : 'border-gray-300'}`}>Monto Fijo (Bs.)</button>
                         </div>
                    </div>

                    <div>
                        <label htmlFor="value" className="block text-sm font-medium text-gray-700">Valor</label>
                        <input
                            id="value"
                            type="number"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            placeholder={type === 'percentage' ? "Ej: 10" : "Ej: 20.50"}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        />
                    </div>
                </div>
                <footer className="p-4 bg-gray-50 border-t grid grid-cols-2 gap-3">
                    <button onClick={handleClear} className="w-full py-3 rounded-lg bg-gray-200 hover:bg-gray-300 font-bold text-gray-700">Quitar Descuento</button>
                    <button onClick={handleApply} className="w-full py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold">Aplicar</button>
                </footer>
            </div>
        </div>
    );
};

export default DiscountModal;
