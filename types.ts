import React from 'react';

export interface BundleOffer {
  quantity: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  cost?: number;
  price: number;
  image: string;
  category: string;
  weight?: string;
  discountPercent?: number;
  bundleOffers?: BundleOffer[];
  tags?: string[];
  stock: number; // Fundamental for inventory
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number; // positive for reception, negative for sale/adjustment
  type: 'reception' | 'sale-pos' | 'sale-online' | 'adjustment' | 'return';
  reason?: string; // e.g., "Damaged", "Expired", "Invoice #123"
  date: string;
}

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  subcategories?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  cost: number; // Snapshot of the cost at the time of adding to cart/order
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  contactMethod: 'telegram' | 'whatsapp';
  contactId: string;
}

export interface Address {
    id:string;
    userId: string;
    street: string;
    city: string;
    reference: string;
    location?: { lat: number; lng: number };
}

export type OrderStatus = 'Recibido' | 'En preparación' | 'Listo para recoger' | 'En camino' | 'Entregado' | 'Cancelado' | 'Devuelto';
export type FulfillmentStatus = 'No preparado' | 'En preparación' | 'Listo para despacho' | 'En ruta' | 'Entregado' | 'Cancelado' | 'Listo con faltantes';

export interface Discount {
  code: string;
  amount: number;
}

export interface Order {
    id: string;
    userId: string;
    items: CartItem[]; // Now contains cost
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    discount?: Discount;
    total: number;
    status: OrderStatus;
    fulfillmentStatus: FulfillmentStatus;
    date: string;
    deliveryAddress: Address;
    repartidorId?: string;
    despachadorId?: string;
    channel: 'Online' | 'POS';
    deliveryNotes?: string;
    
    // Rider performance
    earnings: number;
    tip: number;
    assignedAt?: string;
    pickedUpAt?: string;
    deliveredAt?: string;
}

export interface PromoBanner {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    bgColor: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
}

export interface Driver {
    id: string;
    name: string;
    phone: string;
    photoUrl: string;
    status: 'online' | 'offline' | 'on_route';
    location: {
        lat: number;
        lng: number;
    };
    rating: number;
    deliveriesToday: number;
}

// =============================================
// FINANCIAL TYPES
// =============================================
export type ExpenseCategory = 'Salarios' | 'Alquiler' | 'Servicios' | 'Marketing' | 'Suministros' | 'Impuestos' | 'Otros';

export interface Expense {
    id: string;
    date: string;
    amount: number;
    category: ExpenseCategory;
    description: string;
}

export type ReturnReason = 'Producto dañado' | 'Producto incorrecto' | 'No le gustó al cliente' | 'Otro';

export interface Return {
    id: string;
    orderId: string;
    returnedItems: CartItem[]; // Items with quantity and cost at time of return
    reason: ReturnReason | string;
    restocked: boolean; // Did the items go back to inventory?
    refundAmount: number;
    date: string;
    channel: 'Online' | 'POS';
}
