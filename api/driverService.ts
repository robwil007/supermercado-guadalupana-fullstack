
import { Driver } from '../types';

const MOCK_DRIVERS: Driver[] = [
    {
        id: 'repartidor_01',
        name: 'Carlos Gomez',
        phone: '77712345',
        photoUrl: 'https://i.ibb.co/6PZYf6p/driver-1.png',
        status: 'offline',
        location: { lat: -17.786, lng: -63.180 },
        rating: 4.8,
        deliveriesToday: 0,
    },
    {
        id: 'repartidor_02',
        name: 'Lucia Fernandez',
        phone: '77767890',
        photoUrl: 'https://i.ibb.co/yqg8Wz9/driver-2.png',
        status: 'online',
        location: { lat: -17.775, lng: -63.195 },
        rating: 4.9,
        deliveriesToday: 3,
    },
];

const FAKE_DB_DRIVERS_KEY = 'guadalupana_drivers';

const getDriversFromStorage = (): Driver[] => {
    const data = localStorage.getItem(FAKE_DB_DRIVERS_KEY);
    if (data) {
        return JSON.parse(data);
    }
    // On first load, populate with mock data
    localStorage.setItem(FAKE_DB_DRIVERS_KEY, JSON.stringify(MOCK_DRIVERS));
    return MOCK_DRIVERS;
};

const saveDriversToStorage = (drivers: Driver[]) => {
    localStorage.setItem(FAKE_DB_DRIVERS_KEY, JSON.stringify(drivers));
};

export const getDrivers = (): Promise<Driver[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(getDriversFromStorage());
        }, 200);
    });
};

export const updateDriverStatus = (driverId: string, status: Driver['status']): Promise<Driver> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const allDrivers = getDriversFromStorage();
            const driverIndex = allDrivers.findIndex(d => d.id === driverId);

            if (driverIndex === -1) {
                return reject(new Error("Conductor no encontrado."));
            }

            const updatedDriver: Driver = { ...allDrivers[driverIndex], status };
            allDrivers[driverIndex] = updatedDriver;
            
            saveDriversToStorage(allDrivers);
            resolve(updatedDriver);
        }, 100);
    });
};
