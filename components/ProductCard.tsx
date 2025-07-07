

import React from 'react';
import { Product } from '../types';
import { useCart } from '../context/AppContext';
import { PlusIcon, MinusIcon } from './icons/InterfaceIcons';

interface ProductCardProps {
    product: Product;
    size?: 'small' | 'large';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, size = 'large' }) => {
    const { cart, addToCart, updateQuantity } = useCart();
    const cartItem = cart.find(item => item.id === product.id);
    const finalPrice = product.discountPercent ? product.price * (1 - product.discountPercent / 100) : product.price;

    const isLarge = size === 'large';

    return (
        <div className="bg-white rounded-xl overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-lg border border-gray-100/50 h-full">
            <div className="relative">
                <img className={`w-full object-contain p-2 ${isLarge ? 'h-48 sm:h-56' : 'h-40'}`} src={product.image} alt={product.name} />
                {product.discountPercent && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{product.discountPercent}%
                    </div>
                )}
            </div>
            <div className={`flex-grow flex flex-col ${isLarge ? 'p-4' : 'p-3'}`}>
                 <div className="flex items-baseline gap-2 mb-1">
                     <span className={`font-bold text-gray-900 ${isLarge ? 'text-2xl' : 'text-xl'}`}>{`Bs. ${finalPrice.toFixed(2)}`}</span>
                     {product.discountPercent && (
                        <span className={`text-gray-400 line-through ${isLarge ? 'text-base' : 'text-sm'}`}>{`Bs. ${product.price.toFixed(2)}`}</span>
                     )}
                </div>

                <h3 className={`font-medium text-gray-800 flex-grow mb-2 ${isLarge ? 'text-base h-12' : 'text-sm h-10'}`}>{product.name}</h3>
                <p className={`text-gray-500 mb-3 ${isLarge ? 'text-sm' : 'text-xs'}`}>{product.weight}</p>

                {product.bundleOffers && product.bundleOffers.length > 0 && (
                    <div className="mb-2 space-y-1">
                        {product.bundleOffers.map((offer, index) => (
                            <div key={index} className="bg-red-50 border border-red-200 text-red-800 text-xs font-semibold px-2 py-1 rounded-md">
                                {`¡Lleva ${offer.quantity} por Bs. ${offer.price}!`}
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="mt-auto">
                    {!cartItem || cartItem.quantity === 0 ? (
                        <button 
                            onClick={() => addToCart(product)}
                            className={`w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition duration-200 flex items-center justify-center ${isLarge ? 'h-11' : 'h-10'}`}
                        >
                            <PlusIcon />
                        </button>
                    ) : (
                        <div className={`flex items-center justify-between bg-white border border-gray-200 rounded-lg ${isLarge ? 'h-11' : 'h-10'}`}>
                            <button onClick={() => updateQuantity(product.id, cartItem.quantity - 1)} className="px-3 py-2 text-primary hover:bg-gray-100 rounded-l-lg h-full flex items-center transition-colors">
                                <MinusIcon />
                            </button>
                            <span className="font-bold text-lg text-gray-800">{cartItem.quantity}</span>
                            <button onClick={() => updateQuantity(product.id, cartItem.quantity + 1)} className="px-3 py-2 text-primary hover:bg-gray-100 rounded-r-lg h-full flex items-center transition-colors">
                                <PlusIcon />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;