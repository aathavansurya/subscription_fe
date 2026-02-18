import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../hooks/useStatistics';
import { useOverduePayments } from '../hooks/usePayments';
import { paymentsAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const AnimatedNumber: React.FC<{ value: number; prefix?: string; suffix?: string }> = ({
  value,
  prefix = '',
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, isLoading: statsLoading, fetchStats } = useDashboardStats();
  const { overduePayments, fetchOverduePayments } = useOverduePayments();

  useEffect(() => {
    // Generate payments for current month on load
    const now = new Date();
    paymentsAPI
      .generateMonthly(now.getMonth() + 1, now.getFullYear())
      .catch(() => {}) // silently fail if already generated
      .finally(() => {
        fetchStats();
        fetchOverduePayments();
      });
  }, []);

  const currentMonth = stats?.currentMonth;
  const collectionRate =
    currentMonth && currentMonth.totalCount > 0
      ? Math.round((currentMonth.paidCount / currentMonth.totalCount) * 100)
      : 0;

  const statCards = [
    {
      title: 'This Month Revenue',
      value: currentMonth?.paidAmount || 0,
      prefix: '$',
      icon: DollarSign,
      trend: currentMonth && currentMonth.paidAmount > 0 ? 'up' : 'neutral',
      color: 'from-purple-600 to-purple-700',
      lightColor: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Total Customers',
      value: stats?.counts.customers || 0,
      icon: Users,
      trend: 'neutral',
      color: 'from-teal-500 to-teal-600',
      lightColor: 'bg-teal-50 text-teal-600',
    },
    {
      title: 'Total Products',
      value: stats?.counts.products || 0,
      icon: Package,
      trend: 'neutral',
      color: 'from-blue-500 to-blue-600',
      lightColor: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Collection Rate',
      value: collectionRate,
      suffix: '%',
      icon: TrendingUp,
      trend: collectionRate >= 80 ? 'up' : 'down',
      color: 'from-emerald-500 to-emerald-600',
      lightColor: 'bg-emerald-50 text-emerald-600',
    },
  ];

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
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
        </div>
        <Button
          onClick={() => navigate('/payments')}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/25"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          View Payments
        </Button>
      </motion.div>

      {/* Overdue Alert Section */}
      {overduePayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
                    Overdue Payments
                    <Badge variant="destructive" className="animate-pulse">
                      {overduePayments.length}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {overduePayments.length} payments are overdue from previous months.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {overduePayments.slice(0, 5).map((payment, index) => {
                  const customer = typeof payment.customer === 'object' ? payment.customer : null;
                  const product = typeof payment.product === 'object' ? payment.product : null;
                  return (
                    <motion.div
                      key={payment._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                          <XCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {customer ? customer.name : 'Unknown'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product ? product.name : 'Unknown'} · {payment.month}/{payment.year}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">${payment.amount}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate('/payments')}
                          className="text-xs h-6 px-2"
                        >
                          Pay Now
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {overduePayments.length > 5 && (
                <Button
                  variant="ghost"
                  className="w-full mt-2 text-red-600"
                  onClick={() => navigate('/payments')}
                >
                  View all {overduePayments.length} overdue payments
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${stat.lightColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {stat.trend === 'up' && <TrendingUp className="w-5 h-5 text-emerald-500" />}
                    {stat.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {statsLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                      )}
                    </p>
                  </div>
                </CardContent>
                <div
                  className={`h-1 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Add Product', icon: Package, path: '/products', color: 'from-purple-600 to-purple-700' },
            { label: 'Add Customer', icon: Users, path: '/customers', color: 'from-teal-500 to-teal-600' },
            { label: 'View Payments', icon: CreditCard, path: '/payments', color: 'from-emerald-500 to-emerald-600' },
            { label: 'View Reports', icon: TrendingUp, path: '/statistics', color: 'from-blue-500 to-blue-600' },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
