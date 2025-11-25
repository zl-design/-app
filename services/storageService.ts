import { LocalHistoryItem } from "../types";

const HISTORY_KEY = 'xuanjige_local_history';

export const saveLocalRecord = (record: LocalHistoryItem) => {
    const history = getLocalHistory();
    // Add to top
    const updated = [record, ...history];
    // Limit to 50 records to save space
    if (updated.length > 50) updated.length = 50;
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
};

export const getLocalHistory = (): LocalHistoryItem[] => {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const deleteLocalRecord = (id: string): LocalHistoryItem[] => {
    const history = getLocalHistory();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
};

export const clearLocalHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
};
