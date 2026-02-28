import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Save, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Settings } from "../hooks/useStore";

interface SettingsTabProps {
  settings: Settings;
  updateSettings: (data: Partial<Settings>) => void;
}

export default function SettingsTab({
  settings,
  updateSettings,
}: SettingsTabProps) {
  const [form, setForm] = useState({
    storeNameEn: settings.storeNameEn,
    storeNameKn: settings.storeNameKn,
    phone: settings.phone,
    printLang: settings.printLang,
  });

  const [pinForm, setPinForm] = useState({
    currentPin: "",
    newPin: "",
    confirmPin: "",
  });
  const [showPins, setShowPins] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [pinError, setPinError] = useState("");

  function handleSaveSettings() {
    if (!form.storeNameEn.trim()) {
      toast.error("Store name is required");
      return;
    }
    updateSettings({
      storeNameEn: form.storeNameEn.trim(),
      storeNameKn: form.storeNameKn.trim(),
      phone: form.phone.trim(),
      printLang: form.printLang,
    });
    toast.success("Settings saved!");
  }

  function handleChangePin() {
    setPinError("");
    if (pinForm.currentPin !== settings.pin) {
      setPinError("Current PIN is incorrect");
      return;
    }
    if (!/^\d{4,6}$/.test(pinForm.newPin)) {
      setPinError("New PIN must be 4–6 digits");
      return;
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinError("PINs do not match");
      return;
    }
    updateSettings({ pin: pinForm.newPin });
    setPinForm({ currentPin: "", newPin: "", confirmPin: "" });
    toast.success("PIN changed successfully!");
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-card border-b flex items-center gap-3">
        <Store className="h-5 w-5 text-primary" />
        <div>
          <h2 className="font-semibold">Settings</h2>
          <p className="text-xs text-muted-foreground">
            Manage your store info &amp; preferences
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Store Info */}
        <section className="bg-card rounded-xl border shadow-xs p-4 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Store Information
          </h3>
          <div>
            <Label className="text-sm mb-1.5 block">
              Store Name (English) <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.storeNameEn}
              onChange={(e) =>
                setForm((f) => ({ ...f, storeNameEn: e.target.value }))
              }
              placeholder="e.g. Krishna Stores"
              className="h-11"
            />
          </div>
          <div>
            <Label className="text-sm mb-1.5 block">Store Name (ಕನ್ನಡ)</Label>
            <Input
              value={form.storeNameKn}
              onChange={(e) =>
                setForm((f) => ({ ...f, storeNameKn: e.target.value }))
              }
              placeholder="ಉದಾ. ಕೃಷ್ಣ ಸ್ಟೋರ್ಸ್"
              className="h-11"
            />
          </div>
          <div>
            <Label className="text-sm mb-1.5 block">Phone Number</Label>
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="+91 98765 43210"
              className="h-11"
            />
          </div>
        </section>

        {/* Print Settings */}
        <section className="bg-card rounded-xl border shadow-xs p-4 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Print Settings
          </h3>
          <div>
            <Label className="text-sm mb-1.5 block">Receipt Language</Label>
            <Select
              value={form.printLang}
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  printLang: v as Settings["printLang"],
                }))
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English Only</SelectItem>
                <SelectItem value="kn">ಕನ್ನಡ Only</SelectItem>
                <SelectItem value="both">English + ಕನ್ನಡ</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              For 58mm thermal printers
            </p>
          </div>
          <Button onClick={handleSaveSettings} className="w-full h-11">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </section>

        {/* Change PIN */}
        <section className="bg-card rounded-xl border shadow-xs p-4 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Change PIN
          </h3>
          <div>
            <Label className="text-sm mb-1.5 block">Current PIN</Label>
            <div className="relative">
              <Input
                type={showPins.current ? "text" : "password"}
                inputMode="numeric"
                maxLength={6}
                value={pinForm.currentPin}
                onChange={(e) =>
                  setPinForm((f) => ({
                    ...f,
                    currentPin: e.target.value.replace(/\D/g, ""),
                  }))
                }
                placeholder="Enter current PIN"
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPins((s) => ({ ...s, current: !s.current }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPins.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-1.5 block">New PIN (4–6 digits)</Label>
            <div className="relative">
              <Input
                type={showPins.new ? "text" : "password"}
                inputMode="numeric"
                maxLength={6}
                value={pinForm.newPin}
                onChange={(e) =>
                  setPinForm((f) => ({
                    ...f,
                    newPin: e.target.value.replace(/\D/g, ""),
                  }))
                }
                placeholder="Enter new PIN"
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPins((s) => ({ ...s, new: !s.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPins.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-1.5 block">Confirm New PIN</Label>
            <div className="relative">
              <Input
                type={showPins.confirm ? "text" : "password"}
                inputMode="numeric"
                maxLength={6}
                value={pinForm.confirmPin}
                onChange={(e) =>
                  setPinForm((f) => ({
                    ...f,
                    confirmPin: e.target.value.replace(/\D/g, ""),
                  }))
                }
                placeholder="Re-enter new PIN"
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPins((s) => ({ ...s, confirm: !s.confirm }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPins.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          {pinError && <p className="text-sm text-destructive">{pinError}</p>}
          <Button
            onClick={handleChangePin}
            variant="outline"
            className="w-full h-11"
          >
            Change PIN
          </Button>
        </section>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pb-4">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </div>
      </div>
    </div>
  );
}
