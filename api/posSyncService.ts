import { openDB, IDBPDatabase } from 'https://esm.sh/idb@7';
import { Product, CartItem, Discount, Address } from '../types';
import * as productApi from './productService';
import * as orderApi from './orderService';

const DB_NAME = 'GuadalupanaPOS';
const DB_VERSION = 1;
const PRODUCTS_STORE = 'products';
const SALES_QUEUE_STORE = 'salesQueue';

let db: IDBPDatabase;
let syncInterval: number | undefined;

export type SyncStatus = 'synced' | 'syncing' | 'offline';
type StatusCallback = (status: SyncStatus) => void;
let statusCallback: StatusCallback | null = null;

export interface PosSaleData {
    userId: string;
    items: CartItem[]; // Will now include cost
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    total: number;
    deliveryAddress: Address;
    channel: 'POS';
    discount?: Discount;
    paymentMethod: 'cash' | 'card' | 'qr';
}

export const initDB = async (onStatusChange?: StatusCallback) => {
    if (onStatusChange) {
        statusCallback = onStatusChange;
    }

    db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(PRODUCTS_STORE)) {
                db.createObjectStore(PRODUCTS_STORE, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(SALES_QUEUE_STORE)) {
                const salesStore = db.createObjectStore(SALES_QUEUE_STORE, { autoIncrement: true });
                salesStore.createIndex('by_date', 'date');
            }
        },
    });

    // Sync on startup
    syncQueuedSales();

    // Set up periodic sync
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = window.setInterval(syncQueuedSales, 15 * 60 * 1000); // Every 15 minutes
};

const setSyncStatus = (status: SyncStatus) => {
    if (statusCallback) {
        statusCallback(status);
    }
};

// =============================================
// Product Synchronization
// =============================================

export const syncProducts = async (fallbackProducts: Product[]): Promise<Product[]> => {
    setSyncStatus('syncing');
    try {
        const networkProducts = await productApi.getProducts();
        if(!db) await initDB();
        const tx = db.transaction(PRODUCTS_STORE, 'readwrite');
        await tx.store.clear();
        await Promise.all(networkProducts.products.map(p => tx.store.put(p)));
        await tx.done;
        console.log("Product catalog synced to IndexedDB.");
        setSyncStatus('synced');
        return networkProducts.products;
    } catch (error) {
        console.error("Network failed, using local product data.", error);
        setSyncStatus('offline');
        return getLocalProducts(fallbackProducts);
    }
};

export const getLocalProducts = async (fallbackProducts: Product[]): Promise<Product[]> => {
    if (!db) await initDB();
    const products = await db.getAll(PRODUCTS_STORE);
    return products.length > 0 ? products : fallbackProducts;
};


// =============================================
// Sales Synchronization
// =============================================

export const queueSale = async (orderData: PosSaleData) => {
    if (!db) await initDB();
    const saleWithDate = { ...orderData, date: new Date().toISOString() };
    return db.add(SALES_QUEUE_STORE, saleWithDate);
};

export const getQueuedSales = async (): Promise<PosSaleData[]> => {
    if (!db) await initDB();
    return db.getAll(SALES_QUEUE_STORE);
};


export const syncQueuedSales = async (): Promise<boolean> => {
    setSyncStatus('syncing');
    if (!db) await initDB();
    const queuedSales = await db.getAll(SALES_QUEUE_STORE);

    if (queuedSales.length === 0) {
        console.log("No sales in queue to sync.");
        setSyncStatus('synced');
        return true;
    }

    console.log(`Syncing ${queuedSales.length} sales...`);

    try {
        const batchData = queuedSales.map(sale => ({ ...sale, deliveryFee: 0, serviceFee: 0 }));
        await orderApi.createOrdersBatch(batchData);
        
        const tx = db.transaction(SALES_QUEUE_STORE, 'readwrite');
        await tx.store.clear();
        await tx.done;
        console.log("Sales queue successfully synced and cleared.");
        setSyncStatus('synced');
        return true;
    } catch (error) {
        console.error("Failed to sync sales queue to backend:", error);
        setSyncStatus('offline');
        return false;
    }
};

export const clearLocalSales = async () => {
    if (!db) await initDB();
    const tx = db.transaction(SALES_QUEUE_STORE, 'readwrite');
    await tx.store.clear();
    await tx.done;
    console.log("Local sales cleared manually after closing shift.");
}