declare var google: any;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Order, FulfillmentStatus, Driver } from '../types';
import { useData } from '../context/AppContext';
import { useGoogleMaps } from '../context/GoogleMapsContext';
import { LoaderIcon, ArrowLeftIcon, PackageIcon, TruckIcon, DollarSignIcon } from './icons/InterfaceIcons';
import InventoryHub from './InventoryHub';
import { GoogleMap, Marker } from '@react-google-maps/api';
import OrderDetailModal from './OrderDetailModal';
import { MapLoadError } from './MapLoadError';
import FinancialCenter from './FinancialCenter';

const MAP_CENTER_DEFAULT = { lat: -17.7833, lng: -63.1821 }; // Santa Cruz de la Sierra

const FulfillmentStatusChip: React.FC<{ status: FulfillmentStatus }> = ({ status }) => {
    const colorClasses = useMemo(() => {
        switch (status) {
            case 'No preparado': return 'bg-gray-200 text-gray-800';
            case 'En preparación': return 'bg-yellow-200 text-yellow-800';
            case 'Listo para despacho': return 'bg-blue-200 text-blue-800';
            case 'Listo con faltantes': return 'bg-orange-200 text-orange-800';
            case 'En ruta': return 'bg-indigo-200 text-indigo-800';
            case 'Entregado': return 'bg-green-200 text-green-800';
            case 'Cancelado': return 'bg-red-200 text-red-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    }, [status]);

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>
            {status}
        </span>
    );
};


const LogisticsMap: React.FC<{ drivers: Driver[] }> = ({ drivers }) => {
    const { isLoaded, loadError } = useGoogleMaps();

    if (loadError) return <MapLoadError error={loadError} />;
    if (!isLoaded) return <LoaderIcon className="text-primary mx-auto" />;

    return (
         <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={MAP_CENTER_DEFAULT}
            zoom={12}
            options={{ disableDefaultUI: true, zoomControl: true }}
        >
            {drivers.filter(d => d.status !== 'offline').map(driver => (
                <Marker 
                    key={driver.id} 
                    position={driver.location} 
                    title={driver.name}
                    icon={{
                        path: 'M21.99 8c0-.72-.37-1.35-.94-1.7L14.07.34c-.9-.5-2.03-.5-2.93.03L4.1 6.3C3.53 6.65 3.2 7.28 3.2 8v8c0 .72.37 1.35.94 1.7l6.98 5.95c.92.52 2.05.5 2.94-.03l7.04-6.01c.57-.35.9-1 .9-1.7V8zm-10 11.45L5.2 14.73l6.78-5.73 6.82 5.7L12 19.45z',
                        fillColor: driver.status === 'on_route' ? '#4f46e5' : '#10b981',
                        fillOpacity: 1,
                        strokeWeight: 0,
                        rotation: 0,
                        scale: 1.5,
                        anchor: new google.maps.Point(12, 12),
                    }}
                />
            ))}
        </GoogleMap>
    )
}

const OrderKanbanView: React.FC<{ 
    orders: Order[], 
    onOrderClick: (order: Order) => void 
}> = ({ orders, onOrderClick }) => {
    const { assignOrderToDispatcher, assignOrderToRepartidor } = useData();
    
    const columns: FulfillmentStatus[] = ['No preparado', 'En preparación', 'Listo para despacho', 'Listo con faltantes', 'En ruta'];
    
    const ordersByColumn = useMemo(() => {
        const grouped: { [key in FulfillmentStatus]?: Order[] } = {};
        for(const status of columns) {
            grouped[status] = orders.filter(o => o.fulfillmentStatus === status).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        return grouped;
    }, [orders, columns]);

    const handleAssignDispatcher = async (orderId: string) => {
        const mockDispatcherId = 'dispatcher_01'; // In real app, choose from a list
        await assignOrderToDispatcher(orderId, mockDispatcherId);
    };

    const handleAssignRepartidor = async (orderId: string) => {
        const mockRepartidorId = 'repartidor_01'; // In real app, choose from a list
        await assignOrderToRepartidor(orderId, mockRepartidorId);
    };


    return (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {columns.map(status => (
                <div key={status} className="bg-gray-100 rounded-xl">
                    <h3 className="font-bold text-gray-700 p-4 border-b border-gray-200 flex items-center gap-2">
                        <FulfillmentStatusChip status={status} /> ({ordersByColumn[status]?.length || 0})
                    </h3>
                    <div className="p-4 space-y-4 h-[calc(100vh-400px)] overflow-y-auto">
                        {ordersByColumn[status]?.map(order => (
                            <div key={order.id} className="bg-white rounded-lg shadow p-3">
                                <div className="cursor-pointer hover:bg-gray-50 -m-3 p-3" onClick={() => onOrderClick(order)}>
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold">#{order.id.slice(-6)}</p>
                                        <p className="text-sm font-semibold">Bs. {order.total.toFixed(2)}</p>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{order.deliveryAddress.street}</p>
                                    <div className="text-xs mt-2 text-gray-500">{new Date(order.date).toLocaleString('es-ES')}</div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                     {status === 'No preparado' && <button onClick={() => handleAssignDispatcher(order.id)} className="w-full text-sm font-semibold p-2 bg-yellow-400 rounded-lg hover:bg-yellow-500">Asignar a Despachador</button>}
                                     {(status === 'Listo para despacho' || status === 'Listo con faltantes') && <button onClick={() => handleAssignRepartidor(order.id)} className="w-full text-sm font-semibold p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">Asignar Repartidor</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const PosSalesList: React.FC<{ sales: Order[] }> = ({ sales }) => {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Venta</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Artículos</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sales.map(sale => (
                            <tr key={sale.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">#{sale.id.slice(-8)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(sale.date).toLocaleString('es-ES')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">{sale.items.reduce((acc, item) => acc + item.quantity, 0)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-sm">Bs. {sale.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const OrdersHub: React.FC = () => {
    const { orders } = useData();
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
    const [view, setView] = useState<'online' | 'pos'>('online');
    
    const onlineOrders = useMemo(() => orders.filter(o => o.channel === 'Online' && o.status !== 'Entregado' && o.status !== 'Cancelado'), [orders]);
    const posSales = useMemo(() => orders.filter(o => o.channel === 'POS'), [orders]);

    return (
        <div>
            {selectedOrderDetails && <OrderDetailModal order={selectedOrderDetails} onClose={() => setSelectedOrderDetails(null)} />}
            
            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setView('online')} className={`flex items-center gap-2 py-3 px-1 text-base font-semibold transition-colors ${view === 'online' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-800'}`}>
                        <TruckIcon /> Pedidos Online ({onlineOrders.length})
                    </button>
                    <button onClick={() => setView('pos')} className={`flex items-center gap-2 py-3 px-1 text-base font-semibold transition-colors ${view === 'pos' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-800'}`}>
                        <PackageIcon /> Ventas POS ({posSales.length})
                    </button>
                </nav>
            </div>
            
            <div className="mt-6">
                {view === 'online' ? (
                    <OrderKanbanView orders={onlineOrders} onOrderClick={setSelectedOrderDetails} />
                ) : (
                    <PosSalesList sales={posSales} />
                )}
            </div>
        </div>
    );
};


const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { drivers } = useData();
    const [activeTab, setActiveTab] = useState<'orders' | 'logistics' | 'inventory' | 'financials'>('orders');

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'orders':
                return <OrdersHub />;
            case 'logistics':
                return (
                    <div className="mt-6 bg-white rounded-xl shadow-md h-[600px]">
                        <LogisticsMap drivers={drivers} />
                    </div>
                );
            case 'inventory':
                return <InventoryHub />;
            case 'financials':
                return <FinancialCenter />;
            default:
                return null;
        }
    };

    return (
        <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center mb-6">
                 <button onClick={onBack} className="text-gray-700 hover:text-primary p-2 -ml-2 mr-2">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
            </div>

             <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'orders'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Pedidos
                    </button>
                     <button
                        onClick={() => setActiveTab('logistics')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'logistics'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Logística
                    </button>
                    <button
                         onClick={() => setActiveTab('inventory')}
                         className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'inventory'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Centro de Inventario
                    </button>
                     <button
                         onClick={() => setActiveTab('financials')}
                         className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'financials'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <DollarSignIcon className="w-5 h-5" />
                        Centro Financiero
                    </button>
                </nav>
            </div>
            
            <div className="mt-6">
                {renderActiveTab()}
            </div>
        </main>
    );
};

export default AdminDashboard;