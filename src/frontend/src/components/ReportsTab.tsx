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
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Receipt,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Expense, Sale } from "../hooks/useStore";

interface ReportsTabProps {
  sales: Sale[];
  expenses: Expense[];
  addExpense: (data: { description: string; amount: number }) => Expense;
  deleteExpense: (id: string) => void;
}

function isSameDay(isoA: string, isoB: string): boolean {
  return isoA.slice(0, 10) === isoB.slice(0, 10);
}

function isSameMonth(isoA: string, isoB: string): boolean {
  return isoA.slice(0, 7) === isoB.slice(0, 7);
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ReportsTab({
  sales,
  expenses,
  addExpense,
  deleteExpense,
}: ReportsTabProps) {
  const today = new Date().toISOString();
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [expDesc, setExpDesc] = useState("");
  const [expAmt, setExpAmt] = useState("");
  const [showPastSales, setShowPastSales] = useState(false);

  const todaySales = useMemo(
    () => sales.filter((s) => isSameDay(s.date, today)),
    [sales, today],
  );

  const monthSales = useMemo(
    () => sales.filter((s) => isSameMonth(s.date, today)),
    [sales, today],
  );

  const todayExpenses = useMemo(
    () => expenses.filter((e) => isSameDay(e.date, today)),
    [expenses, today],
  );

  const monthExpenses = useMemo(
    () => expenses.filter((e) => isSameMonth(e.date, today)),
    [expenses, today],
  );

  const todayRevenue = useMemo(
    () => todaySales.reduce((s, sale) => s + sale.total, 0),
    [todaySales],
  );

  const monthRevenue = useMemo(
    () => monthSales.reduce((s, sale) => s + sale.total, 0),
    [monthSales],
  );

  const monthExpTotal = useMemo(
    () => monthExpenses.reduce((s, e) => s + e.amount, 0),
    [monthExpenses],
  );

  const netProfit = monthRevenue - monthExpTotal;

  const recentSales = useMemo(
    () => [...sales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10),
    [sales],
  );

  function handleAddExpense() {
    const amount = Number.parseFloat(expAmt);
    if (!expDesc.trim() || Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter valid description and amount");
      return;
    }
    addExpense({ description: expDesc.trim(), amount });
    toast.success("Expense added");
    setExpDesc("");
    setExpAmt("");
    setExpenseDialogOpen(false);
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Date Header */}
      <div className="p-4 bg-primary/5 border-b">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
          Today
        </p>
        <p className="font-semibold text-foreground">{formatFullDate(today)}</p>
      </div>

      <div className="p-3 space-y-4">
        {/* Today's Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl border shadow-xs p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                Today's Revenue
              </span>
            </div>
            <div className="text-xl font-bold text-primary">
              ₹{todayRevenue.toFixed(2)}
            </div>
          </div>
          <div className="bg-card rounded-xl border shadow-xs p-3">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-4 w-4 text-foreground" />
              <span className="text-xs text-muted-foreground">Bills Today</span>
            </div>
            <div className="text-xl font-bold">{todaySales.length}</div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="bg-card rounded-xl border shadow-xs p-4 space-y-3">
          <h3 className="font-semibold text-sm">This Month</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Revenue</span>
              <span className="font-semibold text-primary">
                ₹{monthRevenue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expenses</span>
              <span className="font-semibold text-destructive">
                − ₹{monthExpTotal.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Net Profit</span>
              <span
                className={`font-bold text-base ${netProfit >= 0 ? "text-success" : "text-destructive"}`}
              >
                ₹{netProfit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-card rounded-xl border shadow-xs p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Today's Expenses</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-primary"
              onClick={() => setExpenseDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          {todayExpenses.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No expenses recorded today
            </p>
          ) : (
            <div className="space-y-2">
              {todayExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <span className="truncate block">{exp.description}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(exp.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-destructive">
                      ₹{exp.amount.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteExpense(exp.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="bg-card rounded-xl border shadow-xs p-4">
          <button
            type="button"
            onClick={() => setShowPastSales((v) => !v)}
            className="flex items-center justify-between w-full mb-1"
          >
            <h3 className="font-semibold text-sm">Recent Bills</h3>
            {showPastSales ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <p className="text-xs text-muted-foreground mb-3">
            Last {Math.min(recentSales.length, 10)} bills
          </p>
          {showPastSales && (
            <div className="space-y-2">
              {recentSales.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No bills yet
                </p>
              ) : (
                recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between text-sm py-1 border-b last:border-0"
                  >
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(sale.date)} · {formatTime(sale.date)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sale.items.length} item
                        {sale.items.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <span className="font-semibold text-primary">
                      ₹{sale.total.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="pb-4" />
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
        <DialogContent className="max-w-xs mx-auto">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm mb-1.5 block">Description</Label>
              <Input
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                placeholder="e.g. Shop rent, Electricity bill"
                className="h-11"
              />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Amount (₹)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={expAmt}
                onChange={(e) => setExpAmt(e.target.value)}
                placeholder="0"
                className="h-11"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExpenseDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleAddExpense} className="flex-1">
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
