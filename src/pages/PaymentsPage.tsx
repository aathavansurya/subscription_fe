import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  DollarSign,
  Calendar,
  Package,
  Search,
  Edit2,
  SlidersHorizontal,
} from 'lucide-react';
import { usePayments } from '../hooks/usePayments';
import { useProducts } from '../hooks/useProducts';
import { useCustomers } from '../hooks/useCustomers';
import type { IPayment, PaymentStatus, IProduct, ICustomer } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ── helpers ────────────────────────────────────────────────────────────────────
const resolveCustomerName = (payment: IPayment, customers: ICustomer[]): string => {
  if (typeof payment.customer === 'object' && payment.customer !== null)
    return (payment.customer as any).name || 'Unknown';
  return customers.find((c) => c._id === payment.customer)?.name || 'Unknown Customer';
};

const resolveProductName = (payment: IPayment, products: IProduct[]): string => {
  if (typeof payment.product === 'object' && payment.product !== null)
    return (payment.product as any).name || 'Unknown';
  return products.find((p) => p._id === payment.product)?.name || 'Unknown Product';
};

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ── main page ──────────────────────────────────────────────────────────────────
const PaymentsPage: React.FC = () => {
  const { products } = useProducts();
  const { customers } = useCustomers();
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear]   = useState(now.getFullYear());
  const [statusFilter, setStatusFilter]   = useState<PaymentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery]     = useState('');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPayment, setEditingPayment]   = useState<IPayment | null>(null);
  const [paymentAmount, setPaymentAmount]     = useState('');

  const filters = {
    month:  selectedMonth,
    year:   selectedYear,
    status: statusFilter === 'all' ? undefined : statusFilter,
  };

  const { payments, isLoading, fetchPayments, updatePayment, markAsPaid } = usePayments(filters);

  useEffect(() => { fetchPayments(); }, [selectedMonth, selectedYear, statusFilter]);

  // last 12 months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  });

  const filteredPayments = payments.filter((p) =>
    resolveCustomerName(p, customers).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    paid:        filteredPayments.filter((p) => p.status === 'paid').length,
    unpaid:      filteredPayments.filter((p) => p.status !== 'paid').length,
    totalPaid:   filteredPayments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
    totalUnpaid: filteredPayments.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.amount, 0),
  };

  const handleMarkAsPaid = async (payment: IPayment) => {
    try {
      await markAsPaid(payment._id, payment.amount);
      toast.success('Payment marked as paid');
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark as paid');
    }
  };

  const openEditModal = (payment: IPayment) => {
    setEditingPayment(payment);
    setPaymentAmount(payment.amount.toString());
    setIsEditModalOpen(true);
  };

  const handleUpdateAmount = async () => {
    if (!editingPayment) return;
    try {
      await updatePayment(editingPayment._id, { amount: parseFloat(paymentAmount) });
      toast.success('Amount updated');
      setIsEditModalOpen(false);
      setEditingPayment(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const selectedMonthLabel = `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-24 lg:pb-6">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
            Payments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{selectedMonthLabel}</p>
        </div>

        {/* Filter trigger — visible on mobile */}
        <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2 lg:hidden">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {statusFilter !== 'all' && (
                <span className="w-2 h-2 rounded-full bg-purple-600" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-8">
            <SheetHeader className="mb-4">
              <SheetTitle>Filter Payments</SheetTitle>
            </SheetHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Month</Label>
                <Select
                  value={`${selectedYear}-${selectedMonth}`}
                  onValueChange={(v) => {
                    const [y, m] = v.split('-');
                    setSelectedYear(parseInt(y));
                    setSelectedMonth(parseInt(m));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((opt) => (
                      <SelectItem key={`${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>
                        {MONTH_NAMES[opt.month - 1]} {opt.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'paid', 'unpaid'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => { setStatusFilter(s); setFilterSheetOpen(false); }}
                      className={`py-2 rounded-lg text-sm font-medium capitalize border transition-colors ${
                        statusFilter === s
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                          : 'border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </motion.div>

      {/* ── Stats Cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-2 gap-3"
      >
        <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium">Paid</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {stats.paid}
            </p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
              ₹{stats.totalPaid.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">Unpaid</p>
            <p className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-300">
              {stats.unpaid}
            </p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">
              ₹{stats.totalUnpaid.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Desktop filters (hidden on mobile) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="hidden lg:flex gap-3 items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={`${selectedYear}-${selectedMonth}`}
          onValueChange={(v) => {
            const [y, m] = v.split('-');
            setSelectedYear(parseInt(y));
            setSelectedMonth(parseInt(m));
          }}
        >
          <SelectTrigger className="w-44">
            <Calendar className="w-4 h-4 mr-2 shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((opt) => (
              <SelectItem key={`${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>
                {MONTH_NAMES[opt.month - 1]} {opt.year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {(['all', 'paid', 'unpaid'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Mobile search ── */}
      <div className="lg:hidden relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* ── Active filter pills (mobile) ── */}
      {(statusFilter !== 'all') && (
        <div className="flex gap-2 lg:hidden">
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-medium"
            >
              {statusFilter}
              <XCircle className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* ── Payments List ── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  </div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            No payments found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Try adjusting your filters
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {filteredPayments.map((payment, index) => {
              const customerName = resolveCustomerName(payment, customers);
              const productName  = resolveProductName(payment, products);
              const isPaid       = payment.status === 'paid';

              return (
                <motion.div
                  key={payment._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  layout
                >
                  <Card className="group overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-3 sm:p-4">

                      {/* ── Row 1: avatar + info + amount ── */}
                      <div className="flex items-start gap-3">

                        {/* Status icon */}
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isPaid
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600'
                            : 'bg-red-100 dark:bg-red-900/50 text-red-600'
                        }`}>
                          {isPaid
                            ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            : <XCircle     className="w-4 h-4 sm:w-5 sm:h-5" />
                          }
                        </div>

                        {/* Name + product + month */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                            {customerName}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Package className="w-3 h-3" />
                              {productName}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Calendar className="w-3 h-3" />
                              {MONTH_NAMES[payment.month - 1]} {payment.year}
                            </span>
                          </div>
                          {payment.paidDate && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                              Paid {format(new Date(payment.paidDate), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>

                        {/* Amount + badge */}
                        <div className="text-right shrink-0">
                          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            ₹{payment.amount.toLocaleString()}
                          </p>
                          <Badge
                            variant={isPaid ? 'default' : 'destructive'}
                            className={`text-xs ${
                              isPaid ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' : ''
                            }`}
                          >
                            {isPaid ? 'Paid' : payment.status === 'pending' ? 'Pending' : 'Unpaid'}
                          </Badge>
                        </div>
                      </div>

                      {/* ── Row 2: action buttons ── */}
                      <div className="flex items-center justify-end gap-2 mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(payment)}
                          className="h-8 px-2 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        {!isPaid && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsPaid(payment)}
                            className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Mark Paid
                          </Button>
                        )}
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Edit Amount Modal ── */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Amount</DialogTitle>
            <DialogDescription>
              {editingPayment && (
                <>Update amount for <strong>{resolveCustomerName(editingPayment, customers)}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (₹)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateAmount}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default PaymentsPage;