

import React, { useState, useEffect } from 'react';
import { Product, Category, BundleOffer } from '../types';
import { useData } from '../context/AppContext';
import { XIcon, TrashIcon, PlusIcon, LoaderIcon } from './icons/InterfaceIcons';

interface ProductDetailPanelProps {
    product: Product | Partial<Product>;
    categories: Category[];
    onClose: () => void;
    isNew: boolean;
}

const ProductDetailPanel: React.FC<ProductDetailPanelProps> = ({ product, categories, onClose, isNew }) => {
    const { updateProduct, createProduct } = useData();
    const [editedProduct, setEditedProduct] = useState<Product | Partial<Product>>({ ...product });
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        setEditedProduct({ ...product });
    }, [product]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedProduct(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleOfferChange = (index: number, field: keyof BundleOffer, value: string) => {
        const newOffers = [...(editedProduct.bundleOffers || [])];
        newOffers[index] = { ...newOffers[index], [field]: parseInt(value, 10) || 0 };
        setEditedProduct(prev => ({ ...prev, bundleOffers: newOffers }));
    };

    const addOffer = () => {
        const newOffers = [...(editedProduct.bundleOffers || []), { quantity: 0, price: 0 }];
        setEditedProduct(prev => ({ ...prev, bundleOffers: newOffers }));
    };

    const removeOffer = (index: number) => {
        const newOffers = (editedProduct.bundleOffers || []).filter((_, i) => i !== index);
        setEditedProduct(prev => ({ ...prev, bundleOffers: newOffers }));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        if (isNew) {
            await createProduct(editedProduct as Omit<Product, 'id' | 'stock'>);
        } else {
            await updateProduct(editedProduct as Product);
        }
        setIsSaving(false);
        onClose();
    };
    
    return (
        <div className="w-96 bg-white shadow-2xl flex-shrink-0 flex flex-col h-full animate-slide-in-right">
            <header className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold">{isNew ? "Añadir Nuevo Producto" : "Detalles del Producto"}</h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon /></button>
            </header>

            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                <div>
                    <label className="text-sm font-medium text-gray-700">Nombre</label>
                    <input type="text" name="name" value={editedProduct.name || ''} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded"/>
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-700">Categoría</label>
                    <select name="category" value={editedProduct.category || ''} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded bg-white">
                        <option value="">Seleccione una categoría</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Costo (Bs.)</label>
                        <input type="number" name="cost" value={editedProduct.cost || ''} onChange={handleNumberChange} className="w-full mt-1 p-2 border rounded"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Precio Venta (Bs.)</label>
                        <input type="number" name="price" value={editedProduct.price || ''} onChange={handleNumberChange} className="w-full mt-1 p-2 border rounded"/>
                    </div>
                 </div>
                 <div>
                    <label className="text-sm font-medium text-gray-700">URL de la Imagen</label>
                    <input type="text" name="image" value={editedProduct.image || ''} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded"/>
                </div>
                 <div>
                    <h3 className="text-md font-semibold mt-4 mb-2">Ofertas por Cantidad</h3>
                    <div className="space-y-2">
                        {(editedProduct.bundleOffers || []).map((offer, index) => (
                            <div key={index} className="flex items-center gap-2">
                               <input type="number" placeholder="Cant." value={offer.quantity} onChange={e => handleOfferChange(index, 'quantity', e.target.value)} className="w-1/3 p-2 border rounded"/>
                               <input type="number" placeholder="Precio" value={offer.price} onChange={e => handleOfferChange(index, 'price', e.target.value)} className="w-1/3 p-2 border rounded"/>
                               <button onClick={() => removeOffer(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon/></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addOffer} className="mt-2 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                        <PlusIcon small /> Añadir oferta
                    </button>
                 </div>
            </div>

            <footer className="p-4 bg-gray-50 border-t">
                <button onClick={handleSaveChanges} disabled={isSaving} className="w-full py-2 bg-primary text-white font-bold rounded hover:bg-primary-dark disabled:bg-gray-400 flex justify-center items-center">
                    {isSaving ? <LoaderIcon /> : (isNew ? "Crear Producto" : "Guardar Cambios")}
                </button>
            </footer>
        </div>
    );
};

export default ProductDetailPanel;