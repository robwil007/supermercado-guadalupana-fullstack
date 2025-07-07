
import React, { createContext, useContext, ReactNode } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

// --- CONFIGURATION ---
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || ""; 
const LIBRARIES: ("places" | "visualization")[] = ['places', 'visualization'];

interface GoogleMapsContextType {
    isLoaded: boolean;
    loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

// A wrapper component to conditionally call the hook
const MapsLoader: React.FC<{children: ReactNode}> = ({ children }) => {
     const { isLoaded, loadError } = useJsApiLoader({
        id: 'guadalupana-google-maps-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
    });
    const value = { isLoaded, loadError };
    return (
        <GoogleMapsContext.Provider value={value}>
            {children}
        </GoogleMapsContext.Provider>
    );
}

export const GoogleMapsProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    // If no API key, don't even try to load. Provide a custom error.
    if (!GOOGLE_MAPS_API_KEY) {
        const value = { 
            isLoaded: false, 
            loadError: new Error("No API Key provided") 
        };
        return (
            <GoogleMapsContext.Provider value={value}>
                {children}
            </GoogleMapsContext.Provider>
        );
    }
    
    // If API key exists, use the loader component that contains the hook.
    return <MapsLoader>{children}</MapsLoader>;
};


export const useGoogleMaps = () => {
    const context = useContext(GoogleMapsContext);
    if (context === undefined) {
        throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
    }
    return context;
};
