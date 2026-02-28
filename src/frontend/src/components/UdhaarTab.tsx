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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  IndianRupee,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { UdhaarEntry } from "../hooks/useStore";

interface UdhaarTabProps {
  udhaar: UdhaarEntry[];
  addUdhaarEntry: (data: {
    customerName: string;
    amount: number;
    note: string;
  }) => UdhaarEntry;
  markUdhaarPaid: (id: string) => void;
  deleteUdhaarEntry: (id: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function UdhaarTab({
  udhaar,
  addUdhaarEntry,
  markUdhaarPaid,
  deleteUdhaarEntry,
}: UdhaarTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [paidOpen, setPaidOpen] = useState(false);

  const unpaid = useMemo(
    () =>
      udhaar
        .filter((e) => !e.paid)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [udhaar],
  );

  const paid = useMemo(
    () =>
      udhaar.filter((e) => e.paid).sort((a, b) => b.date.localeCompare(a.date)),
    [udhaar],
  );

  const totalOutstanding = useMemo(
    () => unpaid.reduce((s, e) => s + e.amount, 0),
    [unpaid],
  );

  function handleAdd() {
    const amt = Number.parseFloat(amount);
    if (!name.trim() || Number.isNaN(amt) || amt <= 0) {
      toast.error("Enter valid name and amount");
      return;
    }
    addUdhaarEntry({
      customerName: name.trim(),
      amount: amt,
      note: note.trim(),
    });
    toast.success("Udhaar entry added");
    setName("");
    setAmount("");
    setNote("");
    setDialogOpen(false);
  }

  function handleMarkPaid(id: string) {
    markUdhaarPaid(id);
    toast.success("Marked as paid!");
  }

  function handleDelete(id: string) {
    deleteUdhaarEntry(id);
    setDeleteId(null);
    toast.success("Entry deleted");
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Summary header */}
      <div className="p-4 bg-primary/5 border-b">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Total Outstanding
            </p>
            <p className="text-2xl font-bold text-destructive mt-0.5">
              ₹{totalOutstanding.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {unpaid.length} pending entr{unpaid.length !== 1 ? "ies" : "y"}
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Udhaar
          </Button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Unpaid entries */}
        {unpaid.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
            <CreditCard className="h-10 w-10 opacity-30" />
            <p className="text-sm">No pending Udhaar entries</p>
            <Button
              onClick={() => setDialogOpen(true)}
              variant="outline"
              size="sm"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Entry
            </Button>
          </div>
        ) : (
          <div className="grid gap-2">
            {unpaid.map((entry) => (
              <div
                key={entry.id}
                className="bg-card rounded-xl border shadow-xs p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">
                        {entry.customerName}
                      </span>
                      <Badge variant="destructive" className="text-xs shrink-0">
                        Pending
                      </Badge>
                    </div>
                    {entry.note && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {entry.note}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(entry.date)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-destructive">
                      ₹{entry.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-success border-success/30 hover:bg-success/10 hover:text-success"
                    onClick={() => handleMarkPaid(entry.id)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Mark Paid
                  </Button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(entry.id)}
                    className="h-9 w-9 flex items-center justify-center rounded-md border hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paid entries (collapsible) */}
        {paid.length > 0 && (
          <Collapsible open={paidOpen} onOpenChange={setPaidOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-between w-full bg-card rounded-xl border shadow-xs p-3 text-sm"
              >
                <span className="font-medium text-muted-foreground">
                  Paid Entries ({paid.length})
                </span>
                {paidOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 grid gap-2">
                {paid.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-muted/50 rounded-xl border border-dashed p-3 opacity-70"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate line-through">
                            {entry.customerName}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs text-success border-success/30 shrink-0"
                          >
                            Paid
                          </Badge>
                        </div>
                        {entry.note && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {entry.note}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDate(entry.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-muted-foreground line-through">
                          ₹{entry.amount.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDeleteId(entry.id)}
                          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        <div className="pb-4" />
      </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xs mx-auto">
          <DialogHeader>
            <DialogTitle>Add Udhaar Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm mb-1.5 block">Customer Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramu Bhai"
                className="h-11"
              />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Amount (₹)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="h-11"
              />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">
                Note{" "}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Groceries on 15 March"
                className="resize-none"
                rows={2}
              />
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
            <Button onClick={handleAdd} className="flex-1">
              Add Entry
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
            <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This Udhaar entry will be permanently deleted.
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
