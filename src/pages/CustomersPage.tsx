import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Users, Phone, Package, Search, Check, X } from 'lucide-react';
import { useCustomers } from '../hooks/useCustomers';
import { useProducts } from '../hooks/useProducts';
import type { ICustomer, ICustomerInput, IProduct } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { paymentsAPI } from '../services/api';


// ── helpers ────────────────────────────────────────────────────────────────────
const getProductId = (p: string | IProduct): string =>
  typeof p === 'string' ? p : p._id;

const getProductName = (p: string | IProduct, products: IProduct[]): string => {
  if (typeof p !== 'string') return p.name;
  return products.find((pr) => pr._id === p)?.name || 'Unknown Product';
};

const getProductPrice = (p: string | IProduct, products: IProduct[]): number => {
  if (typeof p !== 'string') return p.price;
  return products.find((pr) => pr._id === p)?.price || 0;
};

// ── multi-product checkbox picker ─────────────────────────────────────────────
interface ProductPickerProps {
  products: IProduct[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

const ProductPicker: React.FC<ProductPickerProps> = ({ products, selected, onChange }) => {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );
  };

  if (products.length === 0) {
    return (
      <p className="text-sm text-slate-400 italic py-2">
        No products available. Add products first.
      </p>
    );
  }

  return (
    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
      {products.map((product) => {
        const isSelected = selected.includes(product._id);
        return (
          <button
            key={product._id}
            type="button"
            onClick={() => toggle(product._id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all duration-150 ${
              isSelected
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Package
                className={`w-4 h-4 shrink-0 ${
                  isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'
                }`}
              />
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isSelected
                      ? 'text-purple-700 dark:text-purple-300'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {product.name}
                </p>
                <p className="text-xs text-slate-400">
                  ${product.price} / {product.billingCycle}
                </p>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded shrink-0 flex items-center justify-center border transition-colors ${
                isSelected
                  ? 'bg-purple-600 border-purple-600'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};

// ── main page ─────────────────────────────────────────────────────────────────
const CustomersPage: React.FC = () => {
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const { customers, isLoading, createCustomer, updateCustomer, deleteCustomer } =
    useCustomers(searchQuery || undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<ICustomer | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenModal = (customer?: ICustomer) => {
    if (customer) {
      setEditingCustomer(customer);
      setName(customer.name);
      setPhone(customer.phone || '');
      setSelectedProductIds(customer.products.map(getProductId));
    } else {
      setEditingCustomer(null);
      setName('');
      setPhone('');
      setSelectedProductIds([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setSelectedProductIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIds.length === 0) {
      toast.error('Please select at least one product');
      return;
    }
    setIsSaving(true);
    try {
      const payload: ICustomerInput = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        products: selectedProductIds,
      };
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, payload);
        const now = new Date();
        paymentsAPI
              .generateMonthly(now.getMonth() + 1, now.getFullYear())
              .catch(() => {}) // silently fail if already generated
        toast.success('Customer updated successfully');
      } else {
        const now = new Date();
        await createCustomer(payload);
        paymentsAPI
              .generateMonthly(now.getMonth() + 1, now.getFullYear())
              .catch(() => {}) // silently fail if already generated
              ;
        toast.success('Customer created successfully');
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save customer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await deleteCustomer(id);
      toast.success('Customer deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete customer');
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
            Customers
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your subscription customers
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </motion.div>

      {/* Customers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : customers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Users className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {searchQuery ? 'No customers found' : 'No customers yet'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {searchQuery
              ? 'Try a different search term'
              : 'Add your first customer to get started'}
          </p>
          {!searchQuery && (
            <Button onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {customers.map((customer, index) => (
              <motion.div
                key={customer._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                            {customer.name}
                          </h3>
                          {/* subscribed products */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {customer.products.length > 0 ? (
                              customer.products.map((p) => (
                                <Badge
                                  key={getProductId(p)}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  <Package className="w-3 h-3 mr-1" />
                                  {getProductName(p, products)}
                                  <span className="ml-1 text-slate-400 font-normal">
                                    ${getProductPrice(p, products)}
                                  </span>
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">No subscriptions</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(customer)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(customer._id)}
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* phone + subscription count footer */}
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                      {customer.phone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {customer.phone}
                        </div>
                      ) : (
                        <span />
                      )}
                      {customer.products.length > 0 && (
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                          {customer.products.length} subscription
                          {customer.products.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <div className="h-1 bg-gradient-to-r from-purple-600 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer
                ? 'Update the customer details and subscriptions below'
                : 'Fill in the details and pick one or more products'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Doe"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 890"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Multi-product picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Subscriptions *
                  {selectedProductIds.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-purple-600 dark:text-purple-400">
                      {selectedProductIds.length} selected
                    </span>
                  )}
                </Label>
                {selectedProductIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedProductIds([])}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>
              <ProductPicker
                products={products}
                selected={selectedProductIds}
                onChange={setSelectedProductIds}
              />
            </div>

            {/* Selected summary chips */}
            {selectedProductIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                {selectedProductIds.map((id) => {
                  const p = products.find((pr) => pr._id === id);
                  if (!p) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                    >
                      {p.name}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedProductIds((prev) => prev.filter((s) => s !== id))
                        }
                        className="ml-0.5 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={selectedProductIds.length === 0 || isSaving}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : editingCustomer ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersPage;
