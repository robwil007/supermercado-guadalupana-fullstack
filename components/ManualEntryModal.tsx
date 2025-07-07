import React, { useState } from 'react';
import { XIcon, BackspaceIcon } from './icons/InterfaceIcons';

interface ManualEntryModalProps {
    onClose: () => void;
    onConfirm: (name: string, price: number) => void;
}

const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ onClose, onConfirm }) => {
    const [price, setPrice] = useState('');
    const [name, setName] = useState('');

    const handleKeyPress = (key: string) => {
        if (key === 'C') {
            setPrice('');
        } else if (price.length < 9) {
            setPrice(price + key);
        }
    };
    
    const handleBackspace = () => {
        setPrice(price.slice(0, -1));
    };

    const handleSubmit = () => {
        const numericPrice = parseFloat(price);
        if (!isNaN(numericPrice) && numericPrice > 0) {
            onConfirm(name, numericPrice);
            onClose();
        } else {
            alert('Por favor, introduce un precio válido.');
        }
    };
    
    const NumpadKey: React.FC<{ value: string | React.ReactNode; onClick: () => void; className?: string }> = ({ value, onClick, className }) => (
        <button onClick={onClick} className={`bg-gray-200/80 hover:bg-gray-300 rounded-lg text-2xl font-semibold text-gray-800 h-16 transition-colors flex items-center justify-center ${className}`}>
            {value}
        </button>
    );

    return (
        <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col animate-fade-in-up">
                <header className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Entrada Manual</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon /></button>
                </header>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="manual-name" className="text-sm font-medium text-gray-700">Nombre del Producto (Opcional)</label>
                        <input
                            id="manual-name"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ej: Tomates por Kilo"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Precio (Bs.)</label>
                        <div className="w-full bg-gray-100 p-4 border-2 rounded-lg text-right text-4xl font-mono font-bold">
                            {price || '0.00'}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(key => (
                            <NumpadKey key={key} value={key} onClick={() => handleKeyPress(key)} />
                        ))}
                        <NumpadKey value="." onClick={() => !price.includes('.') && handleKeyPress('.')} />
                        <NumpadKey value="0" onClick={() => handleKeyPress('0')} />
                        <NumpadKey value={<BackspaceIcon />} onClick={handleBackspace} />
                    </div>
                </div>
                <footer className="p-4 bg-gray-50 border-t">
                    <button onClick={handleSubmit} className="w-full py-3 rounded-lg bg-primary text-white font-bold">Añadir al Carrito</button>
                </footer>
            </div>
        </div>
    );
};

export default ManualEntryModal;