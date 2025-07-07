

import React, { useState } from 'react';
import { useCart, useAuth, useUI } from '../context/AppContext';
import { PlusIcon, MinusIcon, TrashIcon, XIcon } from './icons/InterfaceIcons';

interface CartProps {
    onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ onCheckout }) => {
    const { 
        cart, updateQuantity, removeFromCart, clearCart, 
        cartTotal, cartCount, calculateLineItemTotal
    } = useCart();
    const { user } = useAuth();
    const { openLoginModal } = useUI();
    
    const handleCheckout = () => {
        if (user) {
            onCheckout();
        } else {
            openLoginModal();
        }
    };
    
    if (cartCount === 0) {
        return (
             <div className="bg-white rounded-xl shadow-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Tu Canasta</h2>
                </div>
                <div className="flex-grow flex items-center justify-center text-gray-500 h-64">
                    Tu canasta está vacía.
                </div>
             </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-lg flex flex-col max-h-[85vh]">
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800">Tu Canasta ({cartCount})</h2>
                <button onClick={clearCart} className="text-sm text-primary hover:underline">
                    Limpiar todo
                </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {cart.map(item => {
                    const lineTotal = calculateLineItemTotal(item);
                    const originalLineTotal = item.price * item.quantity;
                    const isDiscounted = lineTotal < originalLineTotal;
                    const appliedBundle = item.bundleOffers?.slice().sort((a,b) => b.quantity - a.quantity).find(b => item.quantity >= b.quantity);

                    return (
                        <div key={item.id} className="flex items-start gap-4">
                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-contain border p-1 flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="font-semibold text-sm text-gray-800 leading-tight">{item.name}</p>
                                <p className="text-xs text-gray-500 mb-1">{item.weight}</p>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-sm text-gray-800">Bs. {lineTotal.toFixed(2)}</p>
                                    {isDiscounted && <p className="text-xs text-gray-400 line-through">Bs. {originalLineTotal.toFixed(2)}</p>}
                                </div>
                                {appliedBundle && (
                                    <div className="mt-1 text-xs font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-md inline-block">
                                        Promo {appliedBundle.quantity}x aplicada
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center border rounded-lg h-8">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 text-primary h-full flex items-center"><MinusIcon small={true} /></button>
                                    <span className="px-2 font-bold text-sm">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 text-primary h-full flex items-center"><PlusIcon small={true}/></button>
                                </div>
                                 <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-xl flex-shrink-0">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-medium text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-gray-900">Bs. {cartTotal.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                    <button 
                        onClick={handleCheckout}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition duration-300">
                        Continuar al Pago
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;