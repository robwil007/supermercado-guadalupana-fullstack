
import React from 'react';
import { Order } from '../types';
import { XIcon, PrinterIcon, UserIcon, MapPinIcon } from './icons/InterfaceIcons';

interface OrderDetailModalProps {
    order: Order;
    onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {

    const handlePrint = () => {
        window.print();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 print:hidden">
            <style>
                {`
                @media print {
                    body > #root > *:not(.printable-modal) {
                        display: none;
                    }
                    .printable-modal {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        box-shadow: none;
                        border: none;
                        max-height: none;
                    }
                }
                `}
            </style>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl relative animate-fade-in-up flex flex-col max-h-[90vh] printable-modal">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Detalles del Pedido #{order.id.slice(-6)}</h2>
                        <p className="text-sm text-gray-500">Fecha: {new Date(order.date).toLocaleString('es-ES')}</p>
                    </div>
                    <div>
                        <button onClick={handlePrint} className="text-gray-600 hover:bg-gray-200 p-2 rounded-full mr-2">
                            <PrinterIcon />
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:bg-gray-200 p-2 rounded-full">
                            <XIcon />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-grow p-6 overflow-y-auto">
                    {/* Customer and Address Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><UserIcon /> Cliente</h3>
                            <p className="text-gray-800">{order.userId}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><MapPinIcon /> Dirección de Entrega</h3>
                            <p className="text-gray-800">{order.deliveryAddress.street}</p>
                            <p className="text-sm text-gray-600">{order.deliveryAddress.city}</p>
                            <p className="text-sm text-gray-500">Ref: {order.deliveryAddress.reference}</p>
                        </div>
                    </div>

                    {/* Items List */}
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 mb-4">Lista de Artículos para Preparar ({order.items.reduce((sum, item) => sum + item.quantity, 0)})</h3>
                        <div className="space-y-3">
                            {order.items.map(item => (
                                <div key={item.id} className="bg-white border p-3 rounded-lg flex items-center gap-4">
                                    <div className="bg-white rounded-md p-1 border flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800">{item.name}</p>
                                        <p className="text-sm text-gray-500">Código de Barras: {item.id}</p>
                                    </div>
                                    <div className="text-center pl-4">
                                        <p className="text-xs text-gray-500">Cantidad</p>
                                        <p className="font-bold text-2xl text-primary">{item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t flex-shrink-0">
                    <button onClick={onClose} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
