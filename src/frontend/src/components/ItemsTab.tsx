import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Item } from "../hooks/useStore";

interface ItemsTabProps {
  items: Item[];
  addItem: (data: Omit<Item, "id">) => Item;
  updateItem: (id: string, data: Partial<Omit<Item, "id">>) => void;
  deleteItem: (id: string) => void;
}

const UNITS = ["kg", "pcs", "litre", "packet", "dozen", "box", "gm", "ml"];

interface FormState {
  nameEn: string;
  nameKn: string;
  price: string;
  unit: string;
}

const emptyForm: FormState = { nameEn: "", nameKn: "", price: "", unit: "kg" };

export default function ItemsTab({
  items,
  addItem,
  updateItem,
  deleteItem,
}: ItemsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  function openAdd() {
    setEditingItem(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  }

  function openEdit(item: Item) {
    setEditingItem(item);
    setForm({
      nameEn: item.nameEn,
      nameKn: item.nameKn,
      price: String(item.price),
      unit: item.unit,
    });
    setErrors({});
    setDialogOpen(true);
  }

  function validate(): boolean {
    const newErrors: Partial<FormState> = {};
    if (!form.nameEn.trim()) newErrors.nameEn = "Name is required";
    const price = Number.parseFloat(form.price);
    if (Number.isNaN(price) || price <= 0)
      newErrors.price = "Enter valid price";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const data = {
      nameEn: form.nameEn.trim(),
      nameKn: form.nameKn.trim(),
      price: Number.parseFloat(form.price),
      unit: form.unit,
    };
    if (editingItem) {
      updateItem(editingItem.id, data);
      toast.success("Item updated");
    } else {
      addItem(data);
      toast.success("Item added");
    }
    setDialogOpen(false);
  }

  function handleDelete(id: string) {
    deleteItem(id);
    setDeleteId(null);
    toast.success("Item deleted");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 bg-card border-b flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="font-semibold text-foreground">Items</h2>
          <p className="text-xs text-muted-foreground">{items.length} items</p>
        </div>
        <Button onClick={openAdd} size="sm" className="h-9 gap-1">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Package className="h-10 w-10 opacity-30" />
            <p className="text-sm">No items yet. Add your first item!</p>
            <Button onClick={openAdd} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
        ) : (
          <div className="grid gap-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-card rounded-lg border shadow-xs px-3 py-2.5"
              >
                <span className="text-xs text-muted-foreground w-5 shrink-0 font-mono">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {item.nameEn}
                  </div>
                  {item.nameKn && (
                    <div className="text-xs text-muted-foreground">
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
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(item.id)}
                    className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Item" : "Add New Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm mb-1.5 block">
                Name (English) <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.nameEn}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nameEn: e.target.value }))
                }
                placeholder="e.g. Rice"
                className={`h-11 ${errors.nameEn ? "border-destructive" : ""}`}
              />
              {errors.nameEn && (
                <p className="text-xs text-destructive mt-1">{errors.nameEn}</p>
              )}
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">
                Name (ಕನ್ನಡ){" "}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <Input
                value={form.nameKn}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nameKn: e.target.value }))
                }
                placeholder="ಉದಾ. ಅಕ್ಕಿ"
                className="h-11"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="text-sm mb-1.5 block">
                  Price (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="0.00"
                  className={`h-11 ${errors.price ? "border-destructive" : ""}`}
                />
                {errors.price && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.price}
                  </p>
                )}
              </div>
              <div className="w-28">
                <Label className="text-sm mb-1.5 block">Unit</Label>
                <Select
                  value={form.unit}
                  onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {editingItem ? "Update" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="max-w-xs mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This item will be permanently removed. Past bills will not be
              affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
