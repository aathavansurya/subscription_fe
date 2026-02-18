import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Package,
} from 'lucide-react';
import { useDashboardStats, useMonthlyStats, useProductStats } from '../hooks/useStatistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

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

const StatisticsPage: React.FC = () => {
  const { stats: dashStats, isLoading: dashLoading } = useDashboardStats();
  const { monthlyStats, isLoading: monthlyLoading } = useMonthlyStats();
  const { productStats, isLoading: productLoading } = useProductStats();

  const isLoading = dashLoading || monthlyLoading || productLoading;

  const currentMonth = dashStats?.currentMonth;
  const collectionRate =
    currentMonth && currentMonth.totalCount > 0
      ? Math.round((currentMonth.paidCount / currentMonth.totalCount) * 100)
      : 0;

  // Chart data
  const monthlyChartData = [...monthlyStats]
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
    .slice(-6)
    .map((item) => ({
      month: `${monthNames[item.month - 1]} ${item.year}`,
      paidAmount: item.paidAmount,
      unpaidAmount: item.unpaidAmount,
    }));

  const productChartData = productStats.map((item) => ({
    name: item.productName,
    revenue: item.totalRevenue,
    customers: item.customerCount,
  }));

  const pieData =
    currentMonth && (currentMonth.paidAmount > 0 || currentMonth.unpaidAmount > 0)
      ? [
          { name: 'Paid', value: currentMonth.paidAmount },
          { name: 'Unpaid', value: currentMonth.unpaidAmount },
        ].filter((d) => d.value > 0)
      : [];

  const statCards = [
    {
      title: 'This Month Collected',
      value: currentMonth?.paidAmount || 0,
      prefix: '$',
      icon: DollarSign,
      color: 'from-purple-600 to-purple-700',
      lightColor: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'This Month Unpaid',
      value: currentMonth?.unpaidAmount || 0,
      prefix: '$',
      icon: TrendingDown,
      color: 'from-red-500 to-red-600',
      lightColor: 'bg-red-50 text-red-600',
    },
    {
      title: 'Total Customers',
      value: dashStats?.counts.customers || 0,
      icon: TrendingUp,
      color: 'from-teal-500 to-teal-600',
      lightColor: 'bg-teal-50 text-teal-600',
    },
    {
      title: 'Collection Rate',
      value: collectionRate,
      suffix: '%',
      icon: PieChartIcon,
      color: 'from-emerald-500 to-emerald-600',
      lightColor: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Statistics</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Analytics and insights for your subscriptions
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32" />
                  </CardContent>
                </Card>
              ))
          : statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <CardContent className="p-6">
                      <div className={`p-3 rounded-xl ${stat.lightColor} inline-flex`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">{stat.title}</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                          <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="h-[400px]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <CardTitle className="text-lg">Monthly Revenue</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : monthlyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="paidAmount" name="Paid" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="unpaidAmount" name="Unpaid" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Paid vs Unpaid Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="h-[400px]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-teal-600" />
                <CardTitle className="text-lg">This Month: Paid vs Unpaid</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                    >
                      {pieData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#EF4444'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Product Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2"
        >
          <Card className="h-[400px]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg">Product-wise Revenue</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : productChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productChartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={120} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StatisticsPage;
