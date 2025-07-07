

import { User } from '../types';

const FAKE_DB_USERS_KEY = 'guadalupana_users';
const FAKE_SESSION_KEY_USER_ID = 'guadalupana_session_uid';

// IIFE to initialize with a default user if the DB is empty.
// This runs only once when the module is first loaded.
(() => {
    const usersStr = localStorage.getItem(FAKE_DB_USERS_KEY);
    if (!usersStr || JSON.parse(usersStr).length === 0) {
        const defaultUser: User = {
            id: 'user_default__1',
            name: 'Cliente Demo',
            email: 'cliente@guadalupana.com',
            phone: '77711122',
            contactMethod: 'whatsapp',
            contactId: '77711122',
        };
        const adminUser: User = {
             id: 'user_admin__1',
            name: 'Admin',
            email: 'admin@guadalupana.com',
            phone: '66611122',
            contactMethod: 'whatsapp',
            contactId: '66611122',
        }
        localStorage.setItem(FAKE_DB_USERS_KEY, JSON.stringify([defaultUser, adminUser]));
        console.log("Default users created: cliente@guadalupana.com, admin@guadalupana.com");
    }
})();


// Helper to get users from localStorage
const getUsersFromStorage = (): User[] => {
    const usersStr = localStorage.getItem(FAKE_DB_USERS_KEY);
    // Should not be empty now on first load, but keep fallback for safety.
    return usersStr ? JSON.parse(usersStr) : [];
};

// Helper to save users to localStorage
const saveUsersToStorage = (users: User[]) => {
    localStorage.setItem(FAKE_DB_USERS_KEY, JSON.stringify(users));
};

export const register = (userData: Omit<User, 'id'>): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsersFromStorage();
            if (users.some(u => u.email === userData.email)) {
                return reject(new Error('El correo electrónico ya está en uso.'));
            }
            const newUser: User = {
                id: `user_${Date.now()}`,
                ...userData
            };
            users.push(newUser);
            saveUsersToStorage(users);
            // SECURITY FIX: Only store the user's ID, not the whole object.
            localStorage.setItem(FAKE_SESSION_KEY_USER_ID, newUser.id);
            resolve(newUser);
        }, 500);
    });
};

export const login = (email: string): Promise<User> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsersFromStorage();
            const user = users.find(u => u.email === email);
            if (user) {
                // SECURITY FIX: Only store the user's ID, not the whole object.
                localStorage.setItem(FAKE_SESSION_KEY_USER_ID, user.id);
                resolve(user);
            } else {
                reject(new Error('Usuario no encontrado. Por favor, regístrate.'));
            }
        }, 500);
    });
};

export const logout = (): void => {
    localStorage.removeItem(FAKE_SESSION_KEY_USER_ID);
};

export const getCurrentUser = (): Promise<User | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const userId = localStorage.getItem(FAKE_SESSION_KEY_USER_ID);
            if (!userId) {
                return resolve(null);
            }
            const users = getUsersFromStorage();
            const user = users.find(u => u.id === userId);
            resolve(user || null);
        }, 50); // Simulate tiny network delay for getting user details
    });
};

export const getAllUsers = (): Promise<User[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(getUsersFromStorage());
        }, 100);
    });
};