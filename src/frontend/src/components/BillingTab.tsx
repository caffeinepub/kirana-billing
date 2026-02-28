import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Minus,
  Plus,
  Printer,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { CartItem, Item, Sale, Settings } from "../hooks/useStore";
import { generateReceipt } from "../utils/print";

interface BillingTabProps {
  items: Item[];
  addSale: (cartItems: CartItem[], total: number) => Sale;
  settings: Settings;
}

function calcSubtotal(ci: CartItem): number {
  const base = ci.item.price * ci.quantity;
  return Math.round(base * (1 - ci.discount / 100) * 100) / 100;
}

export default function BillingTab({
  items,
  addSale,
  settings,
}: BillingTabProps) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [qtyValue, setQtyValue] = useState("1");
  const [discValue, setDiscValue] = useState("0");
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    const num = Number.parseInt(q, 10);
    if (!Number.isNaN(num) && num >= 1 && num <= items.length) {
      return [items[num - 1]];
    }
    return items.filter(
      (it) =>
        it.nameEn.toLowerCase().includes(q) ||
        it.nameKn.includes(q) ||
        it.nameEn.toLowerCase().startsWith(q),
    );
  }, [search, items]);

  const total = useMemo(
    () => cart.reduce((sum, ci) => sum + calcSubtotal(ci), 0),
    [cart],
  );

  function openQtyDialog(item: Item) {
    setSelectedItem(item);
    setQtyValue("1");
    setDiscValue("0");
  }

  function addToCart() {
    if (!selectedItem) return;
    const qty = Number.parseFloat(qtyValue) || 1;
    const disc = Number.parseFloat(discValue) || 0;
    setCart((prev) => {
      const existing = prev.findIndex((ci) => ci.item.id === selectedItem.id);
      if (existing >= 0) {
        return prev.map((ci, i) =>
          i === existing
            ? { ...ci, quantity: ci.quantity + qty, discount: disc }
            : ci,
        );
      }
      return [...prev, { item: selectedItem, quantity: qty, discount: disc }];
    });
    setSelectedItem(null);
    setSearch("");
    searchRef.current?.focus();
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((ci) => ci.item.id !== id));
  }

  function updateCartQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((ci) =>
          ci.item.id === id
            ? { ...ci, quantity: Math.max(0.5, ci.quantity + delta) }
            : ci,
        )
        .filter((ci) => ci.quantity > 0),
    );
  }

  function updateCartDiscount(id: string, value: string) {
    const disc = Math.min(100, Math.max(0, Number.parseFloat(value) || 0));
    setCart((prev) =>
      prev.map((ci) => (ci.item.id === id ? { ...ci, discount: disc } : ci)),
    );
  }

  function clearCart() {
    setCart([]);
    setSearch("");
  }

  function printBill() {
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }
    const sale = addSale(cart, total);
    generateReceipt(sale, settings);
    toast.success("Bill printed & saved!");
    clearCart();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 bg-card border-b sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            placeholder="Search by number, name or ಕನ್ನಡ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 text-base"
            autoComplete="off"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Items list */}
        <div className="p-3 pb-1">
          <p className="text-xs text-muted-foreground mb-2">
            {search
              ? `${filteredItems.length} result${filteredItems.length !== 1 ? "s" : ""}`
              : `${items.length} items — tap to add`}
          </p>
        </div>
        <div className="px-3 grid gap-2">
          {filteredItems.map((item) => {
            const displayNum = items.indexOf(item) + 1;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => openQtyDialog(item)}
                className="flex items-center gap-3 bg-card rounded-lg px-3 py-2.5 shadow-xs border text-left hover:shadow-card transition-all active:scale-[0.98]"
              >
                <span className="text-xs text-muted-foreground w-5 shrink-0 font-mono">
                  {displayNum}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {item.nameEn}
                  </div>
                  {item.nameKn && (
                    <div className="text-xs text-muted-foreground truncate">
                      {item.nameKn}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-sm text-primary">
                    ₹{item.price}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.unit}
                  </div>
                </div>
                <Plus className="h-4 w-4 text-primary shrink-0" />
              </button>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No items found
            </div>
          )}
        </div>

        {/* Cart */}
        {cart.length > 0 && (
          <div className="mt-4 px-3">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">
                Cart ({cart.length} item{cart.length !== 1 ? "s" : ""})
              </h3>
            </div>
            <div className="grid gap-2">
              {cart.map((ci) => (
                <div
                  key={ci.item.id}
                  className="bg-card rounded-lg border shadow-xs p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {ci.item.nameEn}
                      </div>
                      {ci.item.nameKn && (
                        <div className="text-xs text-muted-foreground">
                          {ci.item.nameKn}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(ci.item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateCartQty(ci.item.id, -1)}
                        className="h-7 w-7 rounded-full border bg-secondary flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-10 text-center font-semibold text-sm">
                        {ci.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(ci.item.id, 1)}
                        className="h-7 w-7 rounded-full border bg-secondary flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <span className="text-xs text-muted-foreground ml-1">
                        {ci.item.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          Disc%
                        </span>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={ci.discount}
                          onChange={(e) =>
                            updateCartDiscount(ci.item.id, e.target.value)
                          }
                          className="h-7 w-14 text-xs text-center p-1"
                        />
                      </div>
                      <Badge
                        variant="secondary"
                        className="font-semibold text-sm"
                      >
                        ₹{calcSubtotal(ci).toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total bar */}
            <div className="mt-3 bg-primary/10 rounded-lg p-3 flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">
                ₹{total.toFixed(2)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-3 pb-4">
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={clearCart}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button className="flex-2 h-11 flex-[2]" onClick={printBill}>
                <Printer className="h-4 w-4 mr-1" />
                Print Bill
              </Button>
            </div>
          </div>
        )}

        {cart.length === 0 && <div className="pb-4" />}
      </div>

      {/* Quantity Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-xs mx-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem?.nameEn}</DialogTitle>
            {selectedItem?.nameKn && (
              <p className="text-sm text-muted-foreground">
                {selectedItem.nameKn}
              </p>
            )}
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm mb-1.5 block">
                Quantity ({selectedItem?.unit})
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  onClick={() =>
                    setQtyValue((v) =>
                      String(Math.max(0.5, Number.parseFloat(v) - 1)),
                    )
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={qtyValue}
                  onChange={(e) => setQtyValue(e.target.value)}
                  className="h-11 text-center text-lg font-semibold"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  onClick={() =>
                    setQtyValue((v) => String(Number.parseFloat(v) + 1))
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Discount (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={discValue}
                onChange={(e) => setDiscValue(e.target.value)}
                className="h-11"
                placeholder="0"
              />
            </div>
            {selectedItem && (
              <div className="flex items-center justify-between bg-primary/10 rounded-lg px-3 py-2">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-bold text-primary">
                  ₹
                  {(
                    selectedItem.price *
                    (Number.parseFloat(qtyValue) || 1) *
                    (1 - (Number.parseFloat(discValue) || 0) / 100)
                  ).toFixed(2)}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedItem(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={addToCart} className="flex-1">
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
