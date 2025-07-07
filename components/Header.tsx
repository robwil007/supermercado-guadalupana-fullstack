

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth, useUI, useData, useCart } from '../context/AppContext';
import Logo from './Logo';
import { SearchIcon, MapPinIcon, UserIcon, ChevronDownIcon, XIcon, PlusIcon } from './icons/InterfaceIcons';
import { Address, Product } from '../types';

type View = 'home' | 'category' | 'account' | 'checkout';

interface HeaderProps {
    onNavigate: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    const { user, logout } = useAuth();
    const { openLoginModal, openMapModal } = useUI();
    const { deliveryAddress, setDeliveryAddress, allProducts } = useData();
    const { addToCart } = useCart();
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const searchRef = useRef<HTMLDivElement>(null);

    const searchResults = useMemo(() => {
        if (searchTerm.length < 2) return [];
        const lowerCaseTerm = searchTerm.toLowerCase();
        return allProducts.filter(p => p.name.toLowerCase().includes(lowerCaseTerm) || p.id.toLowerCase().includes(lowerCaseTerm)).slice(0, 5);
    }, [searchTerm, allProducts]);

    const handleUserButtonClick = () => {
        if (user) {
            setMenuOpen(prev => !prev);
        } else {
            openLoginModal();
        }
    };

    const handleAddressClick = () => {
        openMapModal({
            onSelect: (addr) => {
                 // Create a placeholder address if it doesn't exist
                 const newDeliveryAddress: Address = {
                    id: `temp_${Date.now()}`,
                    userId: user?.id || 'guest',
                    street: addr.fullAddress,
                    city: addr.city || 'Santa Cruz de la Sierra',
                    reference: addr.reference || '',
                 };
                 setDeliveryAddress(newDeliveryAddress);
            }
        });
    };
    
    // Close menu/search when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchTerm('');
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <div className="max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div onClick={() => onNavigate('home')}>
                           <Logo />
                        </div>
                        <button 
                            onClick={handleAddressClick}
                            className="hidden md:flex items-center gap-2 bg-gray-100 p-2 rounded-lg text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                            <MapPinIcon />
                            <span className="font-medium text-gray-700 truncate max-w-[200px]">
                                {deliveryAddress ? deliveryAddress.street : 'Indicar dirección'}
                            </span>
                            <ChevronDownIcon />
                        </button>
                    </div>

                    <div className="hidden md:flex flex-grow max-w-lg mx-4" ref={searchRef}>
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon />
                            </div>
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <XIcon />
                                </button>
                            )}
                            {searchResults.length > 0 && searchTerm && (
                                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl py-2 z-50 animate-fade-in-up origin-top">
                                    {searchResults.map(product => (
                                        <div key={product.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-100">
                                            <div className="flex items-center gap-3">
                                                <img src={product.image} alt={product.name} className="w-10 h-10 object-contain"/>
                                                <div>
                                                    <p className="font-semibold text-sm">{product.name}</p>
                                                    <p className="text-xs text-gray-500">Bs. {product.price.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => addToCart(product)} 
                                                className="bg-primary/10 text-primary p-2 rounded-full hover:bg-primary/20"
                                                aria-label={`Añadir ${product.name} al carrito`}
                                            >
                                                <PlusIcon />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center relative" ref={menuRef}>
                        <button
                            onClick={handleUserButtonClick}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-full transition duration-300"
                        >
                            <UserIcon />
                            <span className="hidden sm:inline">{user ? user.name.split(' ')[0] : 'Ingresar'}</span>
                        </button>
                        
                        {user && isMenuOpen && (
                             <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 animate-fade-in-up origin-top-right">
                                <button onClick={() => {onNavigate('account'); setMenuOpen(false);}} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mi Cuenta</button>
                                <hr className="my-2"/>
                                <button onClick={() => {logout(); setMenuOpen(false); onNavigate('home');}} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Cerrar Sesión</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;