import React, { useState } from 'react';
import { useData, useUI } from '../context/AppContext';
import { PlusIcon, TrashIcon, LoaderIcon, MapPinIcon } from './icons/InterfaceIcons';

const AddressForm: React.FC<{
    initialData?: { street: string, city: string, reference: string };
    onCancel: () => void;
}> = ({ initialData, onCancel }) => {
    const { addAddress } = useData();
    const [street, setStreet] = useState(initialData?.street || '');
    const [city, setCity] = useState(initialData?.city || 'Santa Cruz de la Sierra');
    const [reference, setReference] = useState(initialData?.reference || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!street || !city) return;
        setIsSubmitting(true);
        try {
            await addAddress({ street, city, reference });
            onCancel(); // Close form on success
        } catch (error) {
            console.error("Failed to add address", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
         <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 mt-4 animate-fade-in-up">
             <h3 className="font-bold text-md mb-4 text-gray-800">Añadir Nueva Dirección</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="street" className="text-sm font-medium text-gray-700">Calle y Número</label>
                    <input type="text" id="street" value={street} onChange={e => setStreet(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 rounded-lg"/>
                 </div>
                  <div>
                    <label htmlFor="city" className="text-sm font-medium text-gray-700">Ciudad</label>
                    <input type="text" id="city" value={city} onChange={e => setCity(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 rounded-lg"/>
                 </div>
                  <div>
                    <label htmlFor="reference" className="text-sm font-medium text-gray-700">Nota para el repartidor (opcional)</label>
                    <input type="text" id="reference" value={reference} onChange={e => setReference(e.target.value)} placeholder="Ej: Dejar en portería, casa con rejas rojas..." className="mt-1 w-full p-2 border border-gray-300 rounded-lg"/>
                 </div>
                 <div className="flex gap-2 pt-2">
                    <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark disabled:bg-gray-400 flex justify-center items-center">
                        {isSubmitting ? <LoaderIcon /> : 'Guardar Dirección'}
                    </button>
                    <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">
                        Cancelar
                    </button>
                 </div>
             </form>
        </div>
    )
}


const MyAddresses: React.FC<{ isEmbedded?: boolean }> = ({ isEmbedded = false }) => {
    const { addresses, deleteAddress } = useData();
    const { openMapModal } = useUI();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formInitialData, setFormInitialData] = useState<any>();

    const handleDelete = async (addressId: string) => {
        if(window.confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
            setDeletingId(addressId);
            try {
                await deleteAddress(addressId);
            } catch (error) {
                console.error("Failed to delete address", error);
                // Optionally show an error toast to the user
            } finally {
                setDeletingId(null);
            }
        }
    };
    
    const handleOpenMap = () => {
        openMapModal({
            onSelect: (addr) => {
                setFormInitialData({ street: addr.fullAddress, city: addr.city, reference: '' });
                setShowForm(true);
            }
        });
    };

    const handleManualAdd = () => {
        setFormInitialData(undefined); // Clear any previous data from map
        setShowForm(true);
    }
    
    if (isEmbedded) {
         return (
             <div className="pt-2">
                 {showForm ? (
                     <AddressForm onCancel={() => setShowForm(false)} initialData={formInitialData} />
                 ) : (
                    <div className="space-y-3">
                         <button onClick={handleManualAdd} className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors">
                            <PlusIcon />
                            <span className="font-semibold text-sm">Añadir Dirección Manualmente</span>
                        </button>
                        <button onClick={handleOpenMap} className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors">
                            <MapPinIcon />
                            <span className="font-semibold text-sm">Buscar en el Mapa</span>
                        </button>
                    </div>
                 )}
             </div>
         )
    }

    return (
        <div>
            {addresses.length === 0 && !showForm && (
                <div className="text-center py-6">
                    <p className="font-semibold text-gray-600">No tienes direcciones guardadas.</p>
                    <p className="text-sm text-gray-500 mt-1">Añade una para tus futuras compras.</p>
                </div>
            )}
            
            {addresses.length > 0 && (
                <div className="space-y-3">
                    {addresses.map(addr => (
                        <div key={addr.id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-start">
                           <div>
                                <p className="font-semibold text-gray-800">{addr.street}</p>
                                <p className="text-sm text-gray-600">{addr.city}</p>
                                {addr.reference && <p className="text-sm text-gray-500">Ref: {addr.reference}</p>}
                           </div>
                           <button 
                             onClick={() => handleDelete(addr.id)} 
                             disabled={deletingId === addr.id} 
                             className="text-gray-400 hover:text-red-500 p-1 disabled:opacity-50 flex-shrink-0 ml-4"
                             aria-label="Eliminar dirección"
                           >
                               {deletingId === addr.id ? <LoaderIcon className="text-primary" /> : <TrashIcon />}
                           </button>
                        </div>
                    ))}
                </div>
            )}
            
            {showForm ? (
                <AddressForm onCancel={() => setShowForm(false)} initialData={formInitialData} />
            ) : (
                <div className="space-y-3 mt-6">
                    <button onClick={handleManualAdd} className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors">
                        <PlusIcon />
                        <span className="font-semibold">Añadir Dirección Manualmente</span>
                    </button>
                    <button onClick={handleOpenMap} className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors">
                        <MapPinIcon />
                        <span className="font-semibold">Buscar en el Mapa</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyAddresses;