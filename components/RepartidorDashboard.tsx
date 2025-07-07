

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Order, Driver } from '../types';
import * as orderService from '../api/orderService';
import { useData } from '../context/AppContext';
import { useGoogleMaps } from '../context/GoogleMapsContext';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { LoaderIcon, ArrowLeftIcon, PhoneIcon, NavigationIcon, CheckCircleIcon, CameraIcon } from './icons/InterfaceIcons';
import { MapLoadError } from './MapLoadError';


const RepartidorDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { updateOrderStatus, assignOrderToRepartidor, drivers, updateDriverStatus } = useData();
    const MOCK_REPARTIDOR_ID = drivers.length > 0 ? drivers[0].id : 'repartidor_01';
    
    const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
    const [myDeliveries, setMyDeliveries] = useState<Order[]>([]);
    const [activeDelivery, setActiveDelivery] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTakingPhoto, setIsTakingPhoto] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { isLoaded, loadError } = useGoogleMaps();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [pickupOrders, assignedOrders] = await Promise.all([
                orderService.getOrdersForPickup(),
                orderService.getRepartidorOrders(MOCK_REPARTIDOR_ID),
            ]);
            setAvailableOrders(pickupOrders);
            setMyDeliveries(assignedOrders);
        } catch (err) {
            setError("No se pudieron cargar los datos de entrega.");
        } finally {
            setLoading(false);
        }
    }, [MOCK_REPARTIDOR_ID]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000); // Refresh every 15 seconds
        return () => clearInterval(interval);
    }, [fetchData]);
    
    useEffect(() => {
        if(myDeliveries.length > 0) {
            updateDriverStatus(MOCK_REPARTIDOR_ID, 'on_route');
        } else {
            updateDriverStatus(MOCK_REPARTIDOR_ID, 'online');
        }
    }, [myDeliveries, MOCK_REPARTIDOR_ID, updateDriverStatus]);

    const handleAcceptDelivery = async (orderId: string) => {
        try {
            await assignOrderToRepartidor(orderId, MOCK_REPARTIDOR_ID);
            await fetchData();
        } catch (error) {
            alert("Error al aceptar la entrega.");
        }
    };

    const handleInitiateDelivery = (orderId: string) => {
        if(fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    
    const handlePhotoTaken = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0] && activeDelivery) {
            // In a real app, you'd upload this file:
            console.log("Photo taken for order:", activeDelivery.id, event.target.files[0]);
            try {
                await updateOrderStatus(activeDelivery.id, 'Entregado');
                await fetchData();
                setActiveDelivery(null);
            } catch (error) {
                alert("Error al marcar como entregado.");
            }
        }
        setIsTakingPhoto(false);
    }
    
    if (loading) {
        return <div className="flex items-center justify-center h-96"><LoaderIcon className="text-primary" /> Cargando entregas...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 py-10">{error}</div>;
    }

    if (activeDelivery) {
        return (
            <main className="h-screen flex flex-col bg-gray-900 text-white">
                <input type="file" accept="image/*" capture ref={fileInputRef} className="hidden" onChange={handlePhotoTaken}/>
                <header className="p-4 flex items-center gap-4 bg-gray-800 flex-shrink-0">
                    <button onClick={() => setActiveDelivery(null)} className="p-2">
                        <ArrowLeftIcon />
                    </button>
                    <h1 className="text-lg font-bold">Entregando Pedido #{activeDelivery.id.slice(-6)}</h1>
                </header>

                <div className="flex-grow relative">
                   {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={activeDelivery.deliveryAddress.location || { lat: 0, lng: 0 }}
                            zoom={16}
                            options={{ disableDefaultUI: true, zoomControl: true, styles: [ { "featureType": "all", "elementType": "all", "stylers": [ { "invert_lightness": true }, { "saturation": 10 }, { "lightness": 30 }, { "gamma": 0.5 }, { "hue": "#435158" } ] } ] }}
                        >
                            {activeDelivery.deliveryAddress.location && <Marker position={activeDelivery.deliveryAddress.location} />}
                        </GoogleMap>
                   ) : (
                       <div className="w-full h-full flex items-center justify-center">
                           {loadError ? <MapLoadError error={loadError} /> : <LoaderIcon/>}
                       </div>
                   )}
                </div>

                <footer className="bg-gray-800 p-4 space-y-4 rounded-t-2xl flex-shrink-0">
                    <div>
                        <p className="text-sm text-gray-400">Entregar en:</p>
                        <p className="font-semibold text-lg">{activeDelivery.deliveryAddress.street}</p>
                        <p className="text-gray-300">Ref: {activeDelivery.deliveryAddress.reference}</p>
                    </div>
                     <div className="grid grid-cols-2 gap-3">
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${activeDelivery.deliveryAddress.location?.lat},${activeDelivery.deliveryAddress.location?.lng}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-4 bg-blue-500 rounded-xl font-semibold text-lg">
                            <NavigationIcon /> Navegar
                        </a>
                        <a href={`tel:${activeDelivery.userId}`} className="flex items-center justify-center gap-2 p-4 bg-gray-600 rounded-xl font-semibold text-lg">
                            <PhoneIcon /> Llamar
                        </a>
                    </div>
                     <button
                        onClick={() => handleInitiateDelivery(activeDelivery.id)}
                        className="w-full p-4 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition text-xl flex items-center justify-center gap-2"
                    >
                        <CameraIcon /> Marcar como Entregado
                    </button>
                </footer>
            </main>
        )
    }

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center mb-6">
                 <button onClick={onBack} className="text-gray-700 hover:text-primary p-2 -ml-2 mr-2">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Panel del Repartidor</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* My Deliveries */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Mis Entregas en Curso ({myDeliveries.length})</h2>
                     <div className="space-y-4">
                        {myDeliveries.length === 0 ? (
                            <div className="text-gray-500 p-6 bg-white rounded-xl shadow-md text-center">No tienes entregas en curso.</div>
                        ) : (
                            myDeliveries.map(order => (
                                <div key={order.id} onClick={() => setActiveDelivery(order)} className="bg-white p-4 rounded-xl shadow-md cursor-pointer hover:bg-gray-50">
                                    <p className="font-bold">Pedido #{order.id.slice(-6)}</p>
                                    <p className="text-sm text-gray-600">Entregar en: {order.deliveryAddress.street}</p>
                                    <p className="font-semibold mt-2">Total: Bs. {order.total.toFixed(2)}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                {/* Available Orders */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Pedidos Disponibles ({availableOrders.length})</h2>
                    <div className="space-y-4">
                        {availableOrders.length === 0 ? (
                            <div className="text-gray-500 p-6 bg-white rounded-xl shadow-md text-center">No hay pedidos listos para recoger en este momento.</div>
                        ) : (
                            availableOrders.map(order => (
                                <div key={order.id} className="bg-white p-4 rounded-xl shadow-md">
                                    <p className="font-bold">Pedido #{order.id.slice(-6)}</p>
                                    <p className="text-sm text-gray-600">Para: {order.deliveryAddress.street}</p>
                                    <p className="font-semibold mt-2">Total: Bs. {order.total.toFixed(2)}</p>
                                    <button
                                        onClick={() => handleAcceptDelivery(order.id)}
                                        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition"
                                    >
                                        Aceptar Entrega
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
};

export default RepartidorDashboard;