


import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import CategoryMenu from './components/CategoryMenu';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import LoginModal from './components/LoginModal';
import { useUI, useData, useAuth, useCart } from './context/AppContext';
import { promoBanners } from './constants';
import PromoBanners from './components/PromoBanners';
import MobileCartFooter from './components/MobileCartFooter';
import { Category, Product, Address } from './types';
import { ArrowLeftIcon, FilterIcon, SearchIcon, LoaderIcon, TrashIcon, PlusIcon, MinusIcon, XIcon } from './components/icons/InterfaceIcons';
import ProductCarousel from './components/ProductCarousel';
import MyOrders from './components/MyOrders';
import MyAddresses from './components/MyAddresses';
import AddressMapModal from './components/AddressMapModal';
import AdminDashboard from './components/AdminDashboard';
import RepartidorDashboard from './components/RepartidorDashboard';
import POSView from './components/POSView';
import AssistantFAB from './components/AssistantFAB';
import ChatModal from './components/ChatModal';


type View = 'home' | 'category' | 'account' | 'checkout' | 'admin' | 'repartidor' | 'pos';

// =================================================================
// Filter Panel Component (for Category View)
// =================================================================
interface FilterPanelProps {
    onClose: () => void;
    onApply: (filters: { priceRange: [number, number] }) => void;
    maxPrice: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onClose, onApply, maxPrice }) => {
    const [minPrice, setMinPrice] = useState(0);
    const [maxPriceState, setMaxPriceState] = useState(maxPrice);

    const handleApply = () => {
        onApply({ priceRange: [minPrice, maxPriceState] });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-30 flex justify-end" onClick={onClose}>
            <div className="bg-white w-80 h-full shadow-xl animate-slide-in-right" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold">Filtros</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><XIcon /></button>
                </div>
                <div className="p-4 space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Rango de Precios</h3>
                        <div className="space-y-2">
                            <div>
                                <label className="text-sm">Mínimo (Bs.)</label>
                                <input
                                    type="range"
                                    min="0"
                                    max={maxPrice}
                                    value={minPrice}
                                    onChange={e => setMinPrice(Math.min(Number(e.target.value), maxPriceState))}
                                    className="w-full"
                                />
                                <span className="text-sm font-medium">Bs. {minPrice}</span>
                            </div>
                            <div>
                                <label className="text-sm">Máximo (Bs.)</label>
                                <input
                                    type="range"
                                    min="0"
                                    max={maxPrice}
                                    value={maxPriceState}
                                    onChange={e => setMaxPriceState(Math.max(Number(e.target.value), minPrice))}
                                    className="w-full"
                                />
                                <span className="text-sm font-medium">Bs. {maxPriceState}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
                     <button onClick={handleApply} className="w-full bg-primary text-white font-bold py-3 rounded-lg">Aplicar Filtros</button>
                </div>
            </div>
        </div>
    );
};


// =================================================================
// Category View Component
// =================================================================
interface CategoryViewProps {
    category: Category;
    onBack: () => void;
    allProducts: Product[];
}

const CategoryView: React.FC<CategoryViewProps> = ({ category, onBack, allProducts }) => {
    const [activeSubcategory, setActiveSubcategory] = useState(category.subcategories ? category.subcategories[0] : 'Todos');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState<{ priceRange: [number, number] | null }>({ priceRange: null });

    const productsInCategory = useMemo(() => {
        return allProducts.filter(p => p.category === category.name);
    }, [allProducts, category.name]);

    const maxPrice = useMemo(() => Math.ceil(Math.max(...productsInCategory.map(p => p.price), 0)), [productsInCategory]);
    
    const filteredProducts = useMemo(() => {
        let products = productsInCategory;

        if (category.subcategories && activeSubcategory !== 'Todos') {
            products = products.filter(p => p.tags && p.tags.includes(activeSubcategory));
        }

        if (filters.priceRange) {
            products = products.filter(p => p.price >= filters.priceRange![0] && p.price <= filters.priceRange![1]);
        }

        return products;
    }, [productsInCategory, activeSubcategory, category.subcategories, filters]);

    return (
        <>
             {isFilterOpen && (
                <FilterPanel
                    onClose={() => setIsFilterOpen(false)}
                    onApply={(newFilters) => setFilters(newFilters)}
                    maxPrice={maxPrice}
                />
            )}
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                    <button onClick={onBack} className="text-gray-700 hover:text-primary p-2 -ml-2">
                        <ArrowLeftIcon />
                    </button>
                    <h1 className="text-lg font-bold text-gray-800 truncate absolute left-1/2 -translate-x-1/2">{category.name}</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsFilterOpen(true)} className="text-gray-700 hover:text-primary p-2"><FilterIcon /></button>
                        <button className="text-gray-700 hover:text-primary p-2"><SearchIcon /></button>
                    </div>
                </div>
            </header>

            {category.subcategories && category.subcategories.length > 0 && (
                 <div className="bg-white sticky top-[60px] z-10 py-2 shadow-sm">
                     <div className="max-w-[1880px] mx-auto">
                        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                            {category.subcategories.map(sub => (
                                <button
                                    key={sub}
                                    onClick={() => setActiveSubcategory(sub)}
                                    className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                                        activeSubcategory === sub
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
           
            <main className="max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <ProductGrid products={filteredProducts} />
            </main>
        </>
    );
};

// =================================================================
// Checkout View Component
// =================================================================
interface CheckoutViewProps {
    onBack: () => void;
    onOrderPlaced: () => void;
}
const CheckoutView: React.FC<CheckoutViewProps> = ({ onBack, onOrderPlaced }) => {
    const { 
        placeOrder, allProducts, addresses, deliveryAddress, setDeliveryAddress
    } = useData();
    const { 
        cart, cartTotal, deliveryFee, serviceFee, checkoutTotal,
        updateQuantity, clearCart, cartDiscount, applyPromoCode, clearPromoCode
    } = useCart();

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [showPromoInput, setShowPromoInput] = useState(false);


    const handlePlaceOrder = async () => {
        if (!deliveryAddress) {
            alert("Por favor, selecciona o añade una dirección de entrega.");
            return;
        }
        setIsPlacingOrder(true);
        try {
            await placeOrder(deliveryAddress);
            onOrderPlaced();
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Hubo un error al procesar tu pedido. Inténtalo de nuevo.");
        } finally {
            setIsPlacingOrder(false);
        }
    };
    
    const handleApplyPromo = () => {
        if (promoCodeInput) {
            applyPromoCode(promoCodeInput);
            setShowPromoInput(false);
        }
    };

    const handleClearPromo = () => {
        clearPromoCode();
        setPromoCodeInput('');
    }

    const suggestedProducts = useMemo(() => {
        const categoriesInCart = new Set(cart.map(item => item.category));
        if(categoriesInCart.has('Carnes y Aves')) {
            return allProducts.filter(p => p.category === 'Bebidas' || p.category === 'Panadería');
        }
        if(cart.length > 0){
             return allProducts.filter(p => p.category === 'Dulces y Snacks');
        }
        return [];
    }, [cart, allProducts]);

    return (
         <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="text-gray-700 hover:text-primary p-2 -ml-2 mr-2">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Finalizar Compra</h1>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Delivery Details */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Detalles de la Entrega</h2>
                         <div className="space-y-4">
                            {addresses.map(addr => (
                                <div key={addr.id} onClick={() => setDeliveryAddress(addr)}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all flex items-start justify-between ${deliveryAddress?.id === addr.id ? 'border-primary ring-2 ring-primary' : 'border-gray-200 hover:border-gray-400'}`}>
                                    <div>
                                        <p className="font-semibold">{addr.street}</p>
                                        <p className="text-sm text-gray-600">{addr.city}</p>
                                        <p className="text-sm text-gray-500">{addr.reference}</p>
                                    </div>
                                    {deliveryAddress?.id === addr.id && <div className="w-5 h-5 bg-primary rounded-full border-4 border-white ring-2 ring-primary mt-1"></div>}
                                </div>
                            ))}
                        </div>
                        <MyAddresses isEmbedded={true}/>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Tu Pedido</h2>
                            <button onClick={clearCart} className="text-sm text-red-500 hover:underline flex items-center gap-1"><TrashIcon/> Vaciar Carrito</button>
                         </div>
                         <div className="space-y-4">
                            {cart.map(item => (
                                 <div key={item.id} className="flex items-center gap-4">
                                    <img src={item.image} alt={item.name} className="w-20 h-20 object-contain rounded-lg border p-1" />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800">{item.name}</p>
                                        <p className="text-sm text-gray-500">Bs. {item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center border rounded-lg h-10 w-28">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 h-full"><MinusIcon /></button>
                                        <span className="px-2 font-bold flex-grow text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 h-full"><PlusIcon /></button>
                                    </div>
                                    <p className="font-semibold text-lg w-24 text-right">Bs. {(item.price * item.quantity).toFixed(2)}</p>
                                 </div>
                            ))}
                         </div>
                    </div>
                </div>

                 {/* Sticky Summary */}
                <div className="lg:col-span-1 lg:sticky top-24">
                     <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen de tu Compra</h2>
                        
                        <div className="space-y-2 text-base">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Productos</span>
                                <span className="font-medium text-gray-800">Bs. {cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Costo de envío</span>
                                <span className="font-medium text-gray-800">Bs. {deliveryFee.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-gray-600">Tarifa de servicio</span>
                                <span className="font-medium text-gray-800">Bs. {serviceFee.toFixed(2)}</span>
                            </div>
                            {cartDiscount && (
                                <div className="flex justify-between text-green-600">
                                    <span className="font-medium">Descuento ({cartDiscount.code})</span>
                                    <span className="font-medium">- Bs. {cartDiscount.amount.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                         <div className="pt-2">
                             {!cartDiscount && !showPromoInput && (
                                <button onClick={() => setShowPromoInput(true)} className="text-sm text-primary font-semibold hover:underline">
                                    ¿Tienes un código de descuento?
                                </button>
                             )}
                              {showPromoInput && (
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        value={promoCodeInput}
                                        onChange={(e) => setPromoCodeInput(e.target.value)}
                                        placeholder="PROMO10"
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <button onClick={handleApplyPromo} className="px-4 bg-gray-800 text-white rounded-lg font-semibold text-sm">Aplicar</button>
                                </div>
                            )}
                            {cartDiscount && (
                                <button onClick={handleClearPromo} className="text-sm text-red-500 font-semibold hover:underline">
                                    Quitar descuento
                                </button>
                            )}
                        </div>
                        
                        <hr className="my-3"/>

                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold text-gray-800">Total</span>
                            <span className="text-2xl font-bold text-gray-900">Bs. {checkoutTotal.toFixed(2)}</span>
                        </div>

                        <button 
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder || !deliveryAddress || cart.length === 0}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition duration-300 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {isPlacingOrder ? <LoaderIcon /> : 'Pagar y Realizar Pedido'}
                        </button>
                     </div>
                </div>
            </div>

            {/* Cross-sell */}
            {suggestedProducts.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">¿Te olvidas de algo?</h2>
                    <ProductCarousel products={suggestedProducts} />
                </div>
            )}
        </main>
    );
};


// =================================================================
// My Account View Component
// =================================================================
interface MyAccountViewProps {
    onBack: () => void;
}

const MyAccountView: React.FC<MyAccountViewProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('orders');

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center mb-6">
                 <button onClick={onBack} className="text-gray-700 hover:text-primary p-2 -ml-2 mr-2">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Mi Cuenta</h1>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-gray-600">{user?.phone}</p>
            </div>
            
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('orders')} className={`py-3 px-1 text-base font-semibold transition-colors ${activeTab === 'orders' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-800'}`}>
                        Mis Pedidos
                    </button>
                    <button onClick={() => setActiveTab('addresses')} className={`py-3 px-1 text-base font-semibold transition-colors ${activeTab === 'addresses' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-800'}`}>
                        Mis Direcciones
                    </button>
                </nav>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
                {activeTab === 'orders' && <MyOrders />}
                {activeTab === 'addresses' && <MyAddresses />}
            </div>
        </main>
    );
}


// =================================================================
// Main App Component (Router)
// =================================================================
const App: React.FC = () => {
    const { isLoginModalOpen, isMapModalOpen, isChatModalOpen } = useUI();
    const { allProducts, categories, fetchAllData } = useData();
    const { authLoading } = useAuth();
    const [view, setView] = useState<View>('home');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [appError, setAppError] = useState<string | null>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const viewParam = urlParams.get('view') as View;
        if (viewParam && ['admin', 'repartidor', 'pos'].includes(viewParam)) {
            setView(viewParam);
        }
    }, []);

    const promotionalProducts = useMemo(() => allProducts.filter(p => p.discountPercent || (p.bundleOffers && p.bundleOffers.length > 0)), [allProducts]);

    const handleSelectCategory = (category: Category) => {
        setSelectedCategory(category);
        setView('category');
    };

    const handleBackToMain = () => {
        setSelectedCategory(null);
        setView('home');
    };
    
    const renderView = () => {
        if (authLoading) {
            return <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-gray-600">Cargando Supermercado Guadalupana...</div>;
        }

        if (appError) {
            return <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-red-500">{appError}</div>;
        }

        switch(view) {
            case 'category':
                return selectedCategory ? (
                    <CategoryView 
                        category={selectedCategory} 
                        onBack={handleBackToMain}
                        allProducts={allProducts}
                    />
                ) : null;
            case 'account':
                return <MyAccountView onBack={handleBackToMain} />;
            case 'checkout':
                return <CheckoutView onBack={handleBackToMain} onOrderPlaced={() => setView('account')}/>;
            case 'admin':
                return <AdminDashboard onBack={handleBackToMain} />;
            case 'repartidor':
                return <RepartidorDashboard onBack={handleBackToMain} />;
            case 'pos':
                return <POSView onBack={handleBackToMain} allProducts={allProducts}/>;
            case 'home':
            default:
                return (
                     <main className="max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
                        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                            <aside className="hidden lg:block lg:col-span-2">
                                <div className="sticky top-24">
                                   <CategoryMenu categories={categories} onSelectCategory={handleSelectCategory} />
                                </div>
                            </aside>
                            <div className="lg:col-span-7 xl:col-span-8">
                                <PromoBanners banners={promoBanners} />
                                <div id="ofertas" className="mt-8">
                                     <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold text-gray-800">Ofertas y Promociones</h2>
                                    </div>
                                    <ProductCarousel products={promotionalProducts} />
                                </div>
                                {categories.filter(c => c.id !== 'ofertas-cat').map(category => (
                                     <div key={category.id} id={category.id} className="mt-10 scroll-mt-20">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
                                            <button onClick={() => handleSelectCategory(category)} className="text-primary font-semibold text-sm hover:underline">Ver todo &rarr;</button>
                                        </div>
                                        <ProductGrid products={allProducts.filter(p => p.category === category.name).slice(0, 5)} />
                                    </div>
                                ))}
                            </div>
                            <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
                                 <div className="sticky top-24">
                                    <Cart onCheckout={() => setView('checkout')}/>
                                </div>
                            </aside>
                        </div>
                    </main>
                );
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
            { view !== 'pos' && <Header onNavigate={setView} /> }
            <div className="flex-grow">
                {renderView()}
            </div>
            { view !== 'pos' && <MobileCartFooter onCheckout={() => setView('checkout')} /> }
            
            { view !== 'pos' && <AssistantFAB /> }
            {isLoginModalOpen && <LoginModal />}
            {isMapModalOpen && <AddressMapModal />}
            {isChatModalOpen && <ChatModal />}

            <footer className="bg-gray-800 text-white text-center p-2 mt-auto flex justify-center items-center gap-4">
                <button onClick={() => setView('admin')} className="text-sm hover:underline">
                    Acceder como Administrador
                </button>
                <span className="text-gray-500">|</span>
                <button onClick={() => setView('repartidor')} className="text-sm hover:underline">
                    Acceder como Repartidor
                </button>
                 <span className="text-gray-500">|</span>
                <button onClick={() => setView('pos')} className="text-sm hover:underline">
                    Acceder al POS
                </button>
            </footer>
        </div>
    );
};

export default App;
