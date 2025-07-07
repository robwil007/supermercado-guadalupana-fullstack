import { Address } from '../types';

const FAKE_DB_ADDRESSES_KEY = 'guadalupana_addresses';
const CURRENT_ADDRESS_KEY = 'guadalupana_current_address';


const getAddressesFromStorage = (): Address[] => {
    const addressesStr = localStorage.getItem(FAKE_DB_ADDRESSES_KEY);
    return addressesStr ? JSON.parse(addressesStr) : [];
};

const saveAddressesToStorage = (addresses: Address[]) => {
    localStorage.setItem(FAKE_DB_ADDRESSES_KEY, JSON.stringify(addresses));
};

export const getAddresses = (userId: string): Promise<Address[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const allAddresses = getAddressesFromStorage();
            resolve(allAddresses.filter(addr => addr.userId === userId));
        }, 200);
    });
};

export const addAddress = (userId: string, addressData: Omit<Address, 'id' | 'userId'>): Promise<Address> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const allAddresses = getAddressesFromStorage();
            const newAddress: Address = {
                id: `addr_${Date.now()}`,
                userId,
                ...addressData
            };
            allAddresses.push(newAddress);
            saveAddressesToStorage(allAddresses);
            resolve(newAddress);
        }, 300);
    });
};

export const deleteAddress = (addressId: string, userId: string): Promise<Address[]> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let allAddresses = getAddressesFromStorage();
            const addressToDelete = allAddresses.find(a => a.id === addressId);

            if (!addressToDelete || addressToDelete.userId !== userId) {
                return reject(new Error("No se pudo eliminar la dirección."));
            }
            
            allAddresses = allAddresses.filter(addr => addr.id !== addressId);
            saveAddressesToStorage(allAddresses);
            
            const remainingUserAddresses = allAddresses.filter(addr => addr.userId === userId);
            resolve(remainingUserAddresses);
        }, 300);
    });
};


export const setCurrentDeliveryAddress = (address: Address | null) => {
    if (address) {
        localStorage.setItem(CURRENT_ADDRESS_KEY, JSON.stringify(address));
    } else {
        localStorage.removeItem(CURRENT_ADDRESS_KEY);
    }
};

export const getCurrentDeliveryAddress = (): Address | null => {
    const addressStr = localStorage.getItem(CURRENT_ADDRESS_KEY);
    return addressStr ? JSON.parse(addressStr) : null;
};