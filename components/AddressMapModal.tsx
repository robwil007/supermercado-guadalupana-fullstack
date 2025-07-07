

declare var google: any;
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { useUI } from '../context/AppContext';
import { useGoogleMaps } from '../context/GoogleMapsContext';
import { XIcon, SearchIcon, LoaderIcon, LocateIcon, MapPinIcon } from './icons/InterfaceIcons';
import { MapLoadError } from './MapLoadError';

// --- CONFIGURATION ---
const MAP_CENTER_DEFAULT = { lat: -17.7833, lng: -63.1821 }; // Santa Cruz de la Sierra

const AddressMapModal: React.FC = () => {
    const { closeMapModal, getMapModalConfig } = useUI();
    const { isLoaded, loadError } = useGoogleMaps();

    const [map, setMap] = useState<any | null>(null);
    const [markerPosition, setMarkerPosition] = useState(MAP_CENTER_DEFAULT);
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [isGeocoding, setIsGeocoding] = useState(false);
    const searchBoxRef = useRef<any | null>(null);

    const onMapLoad = useCallback((mapInstance: any) => {
        setMap(mapInstance);
        // Set initial marker position
        setMarkerPosition(MAP_CENTER_DEFAULT);
    }, []);
    
    const onSearchBoxLoad = useCallback((ref: any) => {
        searchBoxRef.current = ref;
    }, []);

    const onPlacesChanged = () => {
        if (searchBoxRef.current) {
            const places = searchBoxRef.current.getPlaces();
            if (places && places.length > 0) {
                const place = places[0];
                const location = place.geometry?.location;
                if (location) {
                    setMarkerPosition({ lat: location.lat(), lng: location.lng() });
                    map?.panTo({ lat: location.lat(), lng: location.lng() });
                    map?.setZoom(17);
                    geocodePosition({ lat: location.lat(), lng: location.lng() });
                }
            }
        }
    };
    
    const geocodePosition = useCallback((pos: any) => {
        if (!isLoaded) return;
        setIsGeocoding(true);
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: pos }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                setAddress(results[0].formatted_address);
                const cityComponent = results[0].address_components.find((c: any) => c.types.includes('locality'));
                setCity(cityComponent?.long_name || '');
            } else {
                setAddress('Dirección no encontrada');
            }
            setIsGeocoding(false);
        });
    }, [isLoaded]);

    const onMarkerDragEnd = (e: any) => {
        if (e.latLng) {
            const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            setMarkerPosition(newPos);
            geocodePosition(newPos);
        }
    };
    
    const locateUser = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setMarkerPosition(pos);
                map?.panTo(pos);
                map?.setZoom(17);
                geocodePosition(pos);
            }, () => {
                alert("No se pudo obtener tu ubicación.");
            });
        }
    };
    
    const handleConfirm = () => {
        const config = getMapModalConfig();
        if (config) {
            config.onSelect({
                fullAddress: address,
                city,
            });
        }
        closeMapModal();
    };
    
    // Reverse geocode when map is ready and centered
    useEffect(() => {
        if (isLoaded) {
            geocodePosition(MAP_CENTER_DEFAULT);
        }
    }, [isLoaded, geocodePosition]);


    const renderContent = () => {
        if (loadError) {
            return <div className="p-4 h-full"><MapLoadError error={loadError} /></div>;
        }
        if (!isLoaded) {
            return <div className="flex justify-center items-center h-full"><LoaderIcon className="text-primary" /> Cargando mapa...</div>;
        }
        return (
            <>
                <div className="p-4 bg-white relative z-10 shadow-md">
                     <StandaloneSearchBox
                        onLoad={onSearchBoxLoad}
                        onPlacesChanged={onPlacesChanged}
                    >
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar calle, avenida, o lugar..."
                                className="w-full bg-gray-100 border border-gray-200 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon />
                            </div>
                        </div>
                    </StandaloneSearchBox>
                </div>
                <div className="relative flex-grow">
                     <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={markerPosition}
                        zoom={15}
                        onLoad={onMapLoad}
                        options={{ disableDefaultUI: true, zoomControl: true, gestureHandling: 'greedy' }}
                    >
                        <Marker position={markerPosition} draggable={true} onDragEnd={onMarkerDragEnd}/>
                    </GoogleMap>
                    <button onClick={locateUser} className="absolute bottom-28 right-4 bg-white p-3 rounded-full shadow-lg">
                        <LocateIcon />
                    </button>
                </div>
                 <div className="p-4 bg-white z-10 shadow-top">
                    <div className="flex items-start gap-3 mb-4">
                        <MapPinIcon />
                        <div className="flex-grow">
                            <h3 className="font-semibold text-gray-800">Dirección Seleccionada</h3>
                            <p className="text-gray-600 text-sm">{isGeocoding ? "Buscando..." : address}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleConfirm}
                        disabled={isGeocoding || !address}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center disabled:bg-gray-400"
                    >
                       OK
                    </button>
                </div>
            </>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-0 md:p-4">
            <div className="bg-gray-100 rounded-none md:rounded-2xl shadow-xl w-full h-full md:max-w-2xl md:h-[90vh] relative animate-fade-in-up flex flex-col overflow-hidden">
                <div className="p-4 bg-white flex items-center justify-between flex-shrink-0 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Indica tu dirección</h2>
                    <button
                        onClick={closeMapModal}
                        className="text-gray-400 hover:text-gray-700 p-2"
                    >
                        <XIcon />
                    </button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default AddressMapModal;