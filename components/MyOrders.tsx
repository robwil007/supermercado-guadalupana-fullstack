import React, { useState } from 'react';
import { useData } from '../context/AppContext';
import { Order } from '../types';

const OrderItem: React.FC<{ order: Order }> = ({ order }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getStatusChipColor = (status: Order['status']) => {
        switch (status) {
            case 'Recibido': return 'bg-blue-100 text-blue-800';
            case 'En preparación': return 'bg-yellow-100 text-yellow-800';
            case 'En camino': return 'bg-indigo-100 text-indigo-800';
            case 'Entregado': return 'bg-green-100 text-green-800';
            case 'Cancelado': return 'bg-red-100 text-red-800';
            case 'Devuelto': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleRequestReturn = () => {
        // In a real app, this would open a modal to select items for return.
        // For now, it's a placeholder to show the flow is considered.
        alert(`Se ha iniciado una solicitud de devolución para el pedido #${order.id.slice(-6)}. Nuestro equipo se pondrá en contacto contigo.`);
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex flex-wrap justify-between items-center gap-2">
                    <div>
                        <p className="font-bold text-lg text-gray-800">Pedido #{order.id.slice(-6)}</p>
                        <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                     <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusChipColor(order.status)}`}>{order.status}</span>
                        <p className="font-bold text-xl text-gray-900">Bs. {order.total.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-gray-200 animate-fade-in-up">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2 text-gray-700">Dirección de Entrega:</h4>
                            <div className="text-sm text-gray-600 mb-4 pl-4 border-l-2 border-primary">
                                <p>{order.deliveryAddress.street}</p>
                                <p>{order.deliveryAddress.city}</p>
                                <p>Ref: {order.deliveryAddress.reference}</p>
                            </div>

                            <h4 className="font-semibold mb-2 text-gray-700">Artículos del Pedido:</h4>
                            <ul className="space-y-2">
                                {order.items.map(item => (
                                    <li key={item.id} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 truncate pr-2">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                                        <span className="font-medium text-gray-800">Bs. {(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                             <h4 className="font-semibold mb-2 text-gray-700">Resumen de Pago:</h4>
                             <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                {order.subtotal !== undefined ? (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-medium text-gray-800">Bs. {order.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Costo de Envío</span>
                                            <span className="font-medium text-gray-800">Bs. {order.deliveryFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tarifa de Servicio</span>
                                            <span className="font-medium text-gray-800">Bs. {order.serviceFee.toFixed(2)}</span>
                                        </div>
                                    </>
                                ) : null}
                                <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                                    <span>Total</span>
                                    <span>Bs. {order.total.toFixed(2)}</span>
                                </div>
                            </div>

                            {order.status === 'Entregado' && (
                                <div className="mt-4">
                                    <button onClick={handleRequestReturn} className="w-full text-center py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">
                                        Solicitar Devolución
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MyOrders: React.FC = () => {
    const { orders } = useData();

    if (orders.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-xl font-semibold text-gray-600">No has realizado ningún pedido todavía.</p>
                <p className="text-gray-500 mt-2">¡Explora nuestros productos y haz tu primera compra!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map(order => (
                <OrderItem key={order.id} order={order} />
            ))}
        </div>
    );
};

export default MyOrders;