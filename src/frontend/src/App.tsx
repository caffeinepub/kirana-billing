import { Toaster } from "@/components/ui/sonner";
import {
  BarChart3,
  CreditCard,
  Delete,
  Package,
  Settings as SettingsIcon,
  ShoppingCart,
  Store,
} from "lucide-react";
import { useCallback, useState } from "react";
import BillingTab from "./components/BillingTab";
import ItemsTab from "./components/ItemsTab";
import ReportsTab from "./components/ReportsTab";
import SettingsTab from "./components/SettingsTab";
import UdhaarTab from "./components/UdhaarTab";
import { useStore } from "./hooks/useStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "billing" | "items" | "reports" | "udhaar" | "settings";

const TABS: { id: Tab; label: string; icon: typeof ShoppingCart }[] = [
  { id: "billing", label: "Billing", icon: ShoppingCart },
  { id: "items", label: "Items", icon: Package },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "udhaar", label: "Udhaar", icon: CreditCard },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

// ─── PIN Login Screen ──────────────────────────────────────────────────────────

interface PinLoginProps {
  storeNameEn: string;
  storeNameKn: string;
  onSuccess: () => void;
  correctPin: string;
}

function PinLogin({
  storeNameEn,
  storeNameKn,
  onSuccess,
  correctPin,
}: PinLoginProps) {
  const [entered, setEntered] = useState("");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(false);

  function handleKey(digit: string) {
    if (entered.length >= 6) return;
    const next = entered + digit;
    setEntered(next);
    setError(false);

    // Auto-submit when pin length matches correctPin
    if (next.length === correctPin.length) {
      if (next === correctPin) {
        onSuccess();
      } else {
        setShake(true);
        setError(true);
        setTimeout(() => {
          setEntered("");
          setShake(false);
        }, 500);
      }
    }
  }

  function handleDelete() {
    setEntered((prev) => prev.slice(0, -1));
    setError(false);
  }

  const KEYS = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "del"],
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Store branding */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Store className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold font-display text-foreground">
          {storeNameEn}
        </h1>
        {storeNameKn && (
          <p className="text-lg text-muted-foreground mt-0.5">{storeNameKn}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          Enter PIN to continue
        </p>
      </div>

      {/* PIN dots */}
      <div className={`flex gap-4 mb-8 ${shake ? "animate-pin-shake" : ""}`}>
        {correctPin.split("").map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: PIN dots are positional by definition
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              i < entered.length
                ? error
                  ? "bg-destructive border-destructive"
                  : "bg-primary border-primary"
                : "bg-transparent border-muted-foreground/40"
            }`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
        {KEYS.flat().map((key) => {
          if (key === "") {
            return <div key="empty" />;
          }
          if (key === "del") {
            return (
              <button
                type="button"
                key="del"
                onClick={handleDelete}
                className="h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center text-foreground hover:bg-accent active:scale-95 transition-all shadow-xs"
              >
                <Delete className="h-5 w-5" />
              </button>
            );
          }
          return (
            <button
              type="button"
              key={key}
              onClick={() => handleKey(key)}
              className="h-16 rounded-2xl bg-card border border-border text-xl font-semibold font-display text-foreground hover:bg-accent hover:border-primary/30 active:scale-95 transition-all shadow-xs"
            >
              {key}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-destructive mt-6 animate-fade-in-up">
          Incorrect PIN. Try again.
        </p>
      )}

      <p className="text-xs text-muted-foreground mt-10">Default PIN: 1234</p>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const store = useStore();
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("billing");

  if (!loggedIn) {
    return (
      <>
        <PinLogin
          storeNameEn={store.settings.storeNameEn}
          storeNameKn={store.settings.storeNameKn}
          correctPin={store.settings.pin}
          onSuccess={() => setLoggedIn(true)}
        />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Toaster position="top-center" />

      {/* Top bar */}
      <header className="bg-card border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-bold text-base font-display leading-tight">
            {store.settings.storeNameEn}
          </h1>
          {store.settings.storeNameKn && (
            <p className="text-xs text-muted-foreground leading-tight">
              {store.settings.storeNameKn}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setLoggedIn(false)}
          className="text-xs text-muted-foreground hover:text-foreground border rounded-md px-2 py-1 transition-colors"
        >
          Lock
        </button>
      </header>

      {/* Tab content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "billing" && (
          <div className="h-full overflow-hidden flex flex-col">
            <BillingTab
              items={store.items}
              addSale={store.addSale}
              settings={store.settings}
            />
          </div>
        )}
        {activeTab === "items" && (
          <div className="h-full overflow-hidden flex flex-col">
            <ItemsTab
              items={store.items}
              addItem={store.addItem}
              updateItem={store.updateItem}
              deleteItem={store.deleteItem}
            />
          </div>
        )}
        {activeTab === "reports" && (
          <div className="h-full overflow-y-auto">
            <ReportsTab
              sales={store.sales}
              expenses={store.expenses}
              addExpense={store.addExpense}
              deleteExpense={store.deleteExpense}
            />
          </div>
        )}
        {activeTab === "udhaar" && (
          <div className="h-full overflow-y-auto">
            <UdhaarTab
              udhaar={store.udhaar}
              addUdhaarEntry={store.addUdhaarEntry}
              markUdhaarPaid={store.markUdhaarPaid}
              deleteUdhaarEntry={store.deleteUdhaarEntry}
            />
          </div>
        )}
        {activeTab === "settings" && (
          <div className="h-full overflow-y-auto">
            <SettingsTab
              settings={store.settings}
              updateSettings={store.updateSettings}
            />
          </div>
        )}
      </main>

      {/* Bottom tab bar */}
      <nav className="bg-card border-t shrink-0 safe-area-bottom">
        <div className="grid grid-cols-5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                activeTab === id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-transform ${
                  activeTab === id ? "scale-110" : ""
                }`}
              />
              <span className="text-[10px] font-medium leading-none">
                {label}
              </span>
              {activeTab === id && (
                <div className="absolute bottom-0 h-0.5 w-8 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
