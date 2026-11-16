export const STATS_RANGES = [
  "day",
  "week",
  "month",
  "year",
  "all",
  "custom",
] as const;

export type StatsRangeKey = (typeof STATS_RANGES)[number];

export type StatBreakdown = {
  key: string;
  label: string;
  orders: number;
  revenue: number;
};

export type StatTimelinePoint = {
  key: string;
  label: string;
  orders: number;
  revenue: number;
};

export type StatProduct = {
  id: string;
  title: string;
  quantity: number;
  revenue: number;
  orders: number;
};

export type StatCustomer = {
  key: string;
  name: string;
  email: string | null;
  orders: number;
  revenue: number;
};

export type StatRecentOrder = {
  id: string;
  label: string;
  source: string;
  status: string;
  price: number;
  createdAt: string;
  items: number;
};

export type StatsResponse = {
  range: {
    key: StatsRangeKey;
    label: string;
    from: string | null;
    to: string;
    previousFrom: string | null;
    previousTo: string | null;
  };
  summary: {
    revenue: number;
    paidOrders: number;
    totalOrders: number;
    averageOrderValue: number;
    itemsSold: number;
    uniqueCustomers: number;
    openOrders: number;
    cancelledOrders: number;
    cashCollected: number;
    changeGiven: number;
    onlineRevenue: number;
    registerRevenue: number;
    previousRevenue: number | null;
    revenueChangePct: number | null;
    previousPaidOrders: number | null;
    ordersChangePct: number | null;
  };
  statusBreakdown: StatBreakdown[];
  sourceBreakdown: StatBreakdown[];
  paymentBreakdown: StatBreakdown[];
  timeline: StatTimelinePoint[];
  topProducts: StatProduct[];
  hourly: { hour: number; orders: number; revenue: number }[];
  weekdays: StatBreakdown[];
  topCustomers: StatCustomer[];
  recentOrders: StatRecentOrder[];
};
