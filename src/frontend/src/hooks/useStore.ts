import { useCallback, useEffect, useState } from "react";

// ─── Data Models ──────────────────────────────────────────────────────────────

export interface Item {
  id: string;
  nameEn: string;
  nameKn: string;
  price: number;
  unit: string;
}

export interface CartItem {
  item: Item;
  quantity: number;
  discount: number; // percentage
}

export interface Sale {
  id: string;
  date: string; // ISO date string
  items: CartItem[];
  total: number;
  storeName: string;
}

export interface UdhaarEntry {
  id: string;
  customerName: string;
  amount: number;
  date: string;
  note: string;
  paid: boolean;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
}

export interface Settings {
  storeNameEn: string;
  storeNameKn: string;
  phone: string;
  pin: string;
  printLang: "en" | "kn" | "both";
}

// ─── localStorage Keys ────────────────────────────────────────────────────────

const KEYS = {
  items: "kirana_items",
  sales: "kirana_sales",
  udhaar: "kirana_udhaar",
  expenses: "kirana_expenses",
  settings: "kirana_settings",
} as const;

// ─── Default Data ─────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: Settings = {
  storeNameEn: "My Kirana Store",
  storeNameKn: "ನನ್ನ ಕಿರಾಣಾ ಅಂಗಡಿ",
  phone: "",
  pin: "1234",
  printLang: "both",
};

const DEFAULT_ITEMS: Item[] = [
  { id: "1", nameEn: "Rice", nameKn: "ಅಕ್ಕಿ", price: 60, unit: "kg" },
  { id: "2", nameEn: "Sugar", nameKn: "ಸಕ್ಕರೆ", price: 45, unit: "kg" },
  { id: "3", nameEn: "Salt", nameKn: "ಉಪ್ಪು", price: 20, unit: "kg" },
  { id: "4", nameEn: "Oil", nameKn: "ಎಣ್ಣೆ", price: 180, unit: "litre" },
  { id: "5", nameEn: "Dal", nameKn: "ಬೇಳೆ", price: 120, unit: "kg" },
  { id: "6", nameEn: "Atta / Flour", nameKn: "ಹಿಟ್ಟು", price: 50, unit: "kg" },
  { id: "7", nameEn: "Tea Powder", nameKn: "ಚಹಾ", price: 300, unit: "kg" },
  { id: "8", nameEn: "Soap", nameKn: "ಸಾಬೂನು", price: 40, unit: "pcs" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStore() {
  const [items, setItemsState] = useState<Item[]>(() => {
    const stored = loadFromStorage<Item[] | null>(KEYS.items, null);
    if (stored === null) {
      saveToStorage(KEYS.items, DEFAULT_ITEMS);
      return DEFAULT_ITEMS;
    }
    return stored;
  });

  const [sales, setSalesState] = useState<Sale[]>(() =>
    loadFromStorage<Sale[]>(KEYS.sales, []),
  );

  const [udhaar, setUdhaarState] = useState<UdhaarEntry[]>(() =>
    loadFromStorage<UdhaarEntry[]>(KEYS.udhaar, []),
  );

  const [expenses, setExpensesState] = useState<Expense[]>(() =>
    loadFromStorage<Expense[]>(KEYS.expenses, []),
  );

  const [settings, setSettingsState] = useState<Settings>(() =>
    loadFromStorage<Settings>(KEYS.settings, DEFAULT_SETTINGS),
  );

  // Persist helpers
  const setItems = useCallback((val: Item[] | ((prev: Item[]) => Item[])) => {
    setItemsState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      saveToStorage(KEYS.items, next);
      return next;
    });
  }, []);

  const setSales = useCallback((val: Sale[] | ((prev: Sale[]) => Sale[])) => {
    setSalesState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      saveToStorage(KEYS.sales, next);
      return next;
    });
  }, []);

  const setUdhaar = useCallback(
    (val: UdhaarEntry[] | ((prev: UdhaarEntry[]) => UdhaarEntry[])) => {
      setUdhaarState((prev) => {
        const next = typeof val === "function" ? val(prev) : val;
        saveToStorage(KEYS.udhaar, next);
        return next;
      });
    },
    [],
  );

  const setExpenses = useCallback(
    (val: Expense[] | ((prev: Expense[]) => Expense[])) => {
      setExpensesState((prev) => {
        const next = typeof val === "function" ? val(prev) : val;
        saveToStorage(KEYS.expenses, next);
        return next;
      });
    },
    [],
  );

  const setSettings = useCallback(
    (val: Settings | ((prev: Settings) => Settings)) => {
      setSettingsState((prev) => {
        const next = typeof val === "function" ? val(prev) : val;
        saveToStorage(KEYS.settings, next);
        return next;
      });
    },
    [],
  );

  // ─── Items CRUD ─────────────────────────────────────────────────────────────

  const addItem = useCallback(
    (data: Omit<Item, "id">) => {
      const newItem: Item = { id: generateId(), ...data };
      setItems((prev) => [...prev, newItem]);
      return newItem;
    },
    [setItems],
  );

  const updateItem = useCallback(
    (id: string, data: Partial<Omit<Item, "id">>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item)),
      );
    },
    [setItems],
  );

  const deleteItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [setItems],
  );

  // ─── Sales ──────────────────────────────────────────────────────────────────

  const addSale = useCallback(
    (cartItems: CartItem[], total: number) => {
      const newSale: Sale = {
        id: generateId(),
        date: new Date().toISOString(),
        items: cartItems,
        total,
        storeName: settings.storeNameEn,
      };
      setSales((prev) => [...prev, newSale]);
      return newSale;
    },
    [setSales, settings.storeNameEn],
  );

  // ─── Udhaar ─────────────────────────────────────────────────────────────────

  const addUdhaarEntry = useCallback(
    (data: { customerName: string; amount: number; note: string }) => {
      const entry: UdhaarEntry = {
        id: generateId(),
        date: new Date().toISOString(),
        paid: false,
        ...data,
      };
      setUdhaar((prev) => [...prev, entry]);
      return entry;
    },
    [setUdhaar],
  );

  const markUdhaarPaid = useCallback(
    (id: string) => {
      setUdhaar((prev) =>
        prev.map((e) => (e.id === id ? { ...e, paid: true } : e)),
      );
    },
    [setUdhaar],
  );

  const deleteUdhaarEntry = useCallback(
    (id: string) => {
      setUdhaar((prev) => prev.filter((e) => e.id !== id));
    },
    [setUdhaar],
  );

  // ─── Expenses ───────────────────────────────────────────────────────────────

  const addExpense = useCallback(
    (data: { description: string; amount: number }) => {
      const expense: Expense = {
        id: generateId(),
        date: new Date().toISOString(),
        ...data,
      };
      setExpenses((prev) => [...prev, expense]);
      return expense;
    },
    [setExpenses],
  );

  const deleteExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    },
    [setExpenses],
  );

  // ─── Settings ───────────────────────────────────────────────────────────────

  const updateSettings = useCallback(
    (data: Partial<Settings>) => {
      setSettings((prev) => ({ ...prev, ...data }));
    },
    [setSettings],
  );

  return {
    // State
    items,
    sales,
    udhaar,
    expenses,
    settings,
    // Items
    addItem,
    updateItem,
    deleteItem,
    // Sales
    addSale,
    // Udhaar
    addUdhaarEntry,
    markUdhaarPaid,
    deleteUdhaarEntry,
    // Expenses
    addExpense,
    deleteExpense,
    // Settings
    updateSettings,
  };
}
