
import React from 'react';
import { WarningIcon } from './icons/InterfaceIcons';

interface MapLoadErrorProps {
    error: Error;
}

export const MapLoadError: React.FC<MapLoadErrorProps> = ({ error }) => {
    let title = "Error al Cargar el Mapa";
    let message = "Hubo un problema al cargar el mapa. Algunas funciones pueden estar deshabilitadas.";

    if (error?.message?.includes('No API Key provided')) {
        title = "Configuración Requerida";
        message = "No se ha proporcionado una clave de API de Google Maps. Las funciones del mapa están deshabilitadas.";
    } else if (error?.message?.includes('InvalidKeyMapError')) {
        title = "Clave de API no válida";
        message = "La clave de API de Google Maps no es válida. Por favor, verifica la configuración del sistema.";
    } else if (error?.message?.includes('ApiNotActivatedMapError')) {
         title = "API no Activada";
         message = "La API de Google Maps no está activada para esta clave. Por favor, revisa la configuración.";
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 text-center bg-yellow-50 text-yellow-800 rounded-lg h-full">
            <WarningIcon className="w-12 h-12 mb-2 text-yellow-500"/>
            <p className="font-semibold">{title}</p>
            <p className="text-sm mt-1">{message}</p>
        </div>
    );
};
