import React from 'react';
import { useCart, useAuth, useUI } from '../context/AppContext';
import { ChevronRightIcon, LightningIcon } from './icons/InterfaceIcons';

const FREE_SHIPPING_THRESHOLD = 250;

interface MobileCartFooterProps {
    onCheckout: () => void;
}

const MobileCartFooter: React.FC<MobileCartFooterProps> = ({ onCheckout }) => {
    const { cartCount, cartTotal } = useCart();
    const { user } = useAuth();
    const { openLoginModal } = useUI();

    if (cartCount === 0) {
        return null;
    }

    const handleCheckout = () => {
        if (user) {
            onCheckout();
        } else {
            openLoginModal();
        }
    };

    const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - cartTotal;

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-top z-40">
            {remainingForFreeShipping > 0 && (
                <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                        <LightningIcon />
                        <span>Más Bs. {remainingForFreeShipping.toFixed(2)} para envío gratis</span>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                </div>
            )}
            <div className="p-4">
                 <button 
                    onClick={handleCheckout}
                    className="w-full bg-gray-900 hover:bg-gray-700 text-white font-bold py-3 px-5 rounded-xl transition duration-300 flex justify-between items-center">
                    <span className="text-lg">Ir a Pagar</span>
                    <span className="text-lg">Bs. {cartTotal.toFixed(2)}</span>
                </button>
            </div>
        </div>
    );
};

export default MobileCartFooter;