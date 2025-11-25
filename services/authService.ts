import { User, BaziRecord } from "../types";

const USER_KEY = 'xuanjige_user';
const USERS_DB_KEY = 'xuanjige_users_db'; // Simulates a backend database
const HISTORY_KEY_PREFIX = 'xuanjige_history_';

// Mock Database Helper
const getUsersDb = (): Record<string, string> => {
    const db = localStorage.getItem(USERS_DB_KEY);
    return db ? JSON.parse(db) : {};
};

const saveUserToDb = (phone: string, password: string) => {
    const db = getUsersDb();
    db[phone] = password;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
};

// Auth Functions
export const register = async (phone: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const db = getUsersDb();
    if (db[phone]) {
        throw new Error("该手机号已注册");
    }

    saveUserToDb(phone, password);
    
    // Auto login after register
    const user: User = { phoneNumber: phone, isLoggedIn: true };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
};

export const login = async (phone: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const db = getUsersDb();
    const storedPassword = db[phone];

    if (!storedPassword) {
        throw new Error("账号不存在，请先注册");
    }

    if (storedPassword !== password) {
        throw new Error("密码错误");
    }

    const user: User = { phoneNumber: phone, isLoggedIn: true };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
};

export const getCurrentUser = (): User | null => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
};

export const logout = () => {
    localStorage.removeItem(USER_KEY);
};

// History Management
export const saveBaziRecord = (user: User, record: Omit<BaziRecord, 'id' | 'timestamp'>) => {
    if (!user.isLoggedIn) return;
    
    const key = `${HISTORY_KEY_PREFIX}${user.phoneNumber}`;
    const existing = getBaziHistory(user);
    
    const newRecord: BaziRecord = {
        ...record,
        id: Date.now().toString(),
        timestamp: Date.now()
    };
    
    // Add to top, limit to 20
    const updated = [newRecord, ...existing].slice(0, 20);
    localStorage.setItem(key, JSON.stringify(updated));
};

export const getBaziHistory = (user: User): BaziRecord[] => {
    if (!user.isLoggedIn) return [];
    const key = `${HISTORY_KEY_PREFIX}${user.phoneNumber}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
};

export const deleteBaziRecord = (user: User, id: string) => {
    const key = `${HISTORY_KEY_PREFIX}${user.phoneNumber}`;
    const existing = getBaziHistory(user);
    const updated = existing.filter(r => r.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
};