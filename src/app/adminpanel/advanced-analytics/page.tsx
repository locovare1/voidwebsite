"use client";

import { useEffect, useMemo, useState } from "react";
import { useOrders } from "@/contexts/OrderContext";
import { reviewService } from "@/lib/reviewService";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ChartPieIcon,
  ClockIcon,
  CursorArrowRaysIcon,
  FunnelIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

// Lightweight helpers
function formatCurrency(n: number) {
  return `$${n.toFixed(2)}`;
}

function movingAverage(series: { t: number; v: number }[], window = 7) {
  if (series.length === 0) return [] as { t: number; v: number }[];
  const out: { t: number; v: number }[] = [];
  let sum = 0;
  const q: number[] = [];
  series.forEach((pt) => {
    sum += pt.v;
    q.push(pt.v);
    if (q.length > window) sum -= q.shift()!;
    out.push({ t: pt.t, v: sum / q.length });
  });
  return out;
}

function normalize(min: number, max: number, v: number) {
  if (max === min) return 0;
  return (v - min) / (max - min);
}

export default function AdvancedAnalyticsPage() {
  const { orders } = useOrders();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const r = await reviewService.getAllReviews();
        setReviews(r);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Derived data
  const revenueSeries = useMemo(() => {
    // daily revenue time series
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + o.total);
    });
    const arr = Array.from(map.entries())
      .map(([k, v]) => ({ t: new Date(k).getTime(), v }))
      .sort((a, b) => a.t - b.t);
    return arr;
  }, [orders]);

  const revenue7dma = useMemo(() => movingAverage(revenueSeries, 7), [revenueSeries]);

  const totals = useMemo(() => {
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const avgOrder = orders.length ? totalRevenue / orders.length : 0;
    const avgRating = reviews.length
      ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
      : 0;
    const helpfulTotal = reviews.reduce((s, r) => s + (r.helpful || 0), 0);
    const verifiedShare = reviews.length
      ? reviews.filter((r) => r.verified).length / reviews.length
      : 0;
    // Momentum: last 7d vs prev 7d
    const now = Date.now();
    const d7 = 7 * 24 * 3600 * 1000;
    const sumRange = (start: number, end: number) =>
      orders
        .filter((o) => {
          const t = new Date(o.createdAt).getTime();
          return t >= start && t < end;
        })
        .reduce((s, o) => s + o.total, 0);
    const last7 = sumRange(now - d7, now);
    const prev7 = sumRange(now - 2 * d7, now - d7);
    const momentum = prev7 === 0 ? 1 : (last7 - prev7) / prev7;

    return { totalRevenue, avgOrder, avgRating, helpfulTotal, verifiedShare, momentum };
  }, [orders, reviews]);

  const ratingDist = useMemo(() => {
    const buckets: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      const k = Math.max(1, Math.min(5, r.rating || 0));
      buckets[k as 1 | 2 | 3 | 4 | 5] += 1;
    });
    return buckets;
  }, [reviews]);

  const funnel = useMemo(() => {
    // Derive a simple funnel from order status
    const counts: Record<string, number> = { viewed: 0, pending: 0, accepted: 0, processing: 0, delivered: 0 };
    // Assume each order implies a session: viewed >= orders.length
    counts.viewed = Math.max(orders.length * 3, orders.length); // naive assumption
    orders.forEach((o) => {
      counts.pending += o.status === "pending" ? 1 : 0;
      counts.accepted += o.status === "accepted" ? 1 : 0;
      counts.processing += o.status === "processing" ? 1 : 0;
      counts.delivered += o.status === "delivered" ? 1 : 0;
    });
    return counts;
  }, [orders]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFFFFF]"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Advanced Analytics</h1>
            <p className="text-gray-400 mt-1">Deeper insights, trends, and funnels</p>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totals.totalRevenue)}</p>
              </div>
              <div className="bg-[#2A2A2A] p-3 rounded-lg"><ChartBarIcon className="w-6 h-6 text-[#FFFFFF]"/></div>
            </div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg. Order Value</p>
                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totals.avgOrder)}</p>
              </div>
              <div className="bg-[#2A2A2A] p-3 rounded-lg"><ClockIcon className="w-6 h-6 text-[#FFFFFF]"/></div>
            </div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg. Rating</p>
                <p className="text-2xl font-bold text-white mt-1">{totals.avgRating.toFixed(1)}</p>
              </div>
              <div className="bg-[#2A2A2A] p-3 rounded-lg"><SparklesIcon className="w-6 h-6 text-[#FFFFFF]"/></div>
            </div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Momentum (7d)</p>
                <div className="flex items-baseline gap-2">
                  {totals.momentum >= 0 ? (
                    <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-5 h-5 text-red-400" />
                  )}
                  <p className={`text-2xl font-bold ${totals.momentum >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {(totals.momentum * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="bg-[#2A2A2A] p-3 rounded-lg"><CursorArrowRaysIcon className="w-6 h-6 text-[#FFFFFF]"/></div>
            </div>
          </div>
        </div>

        {/* Trend + Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 7-day Moving Average Revenue */}
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Revenue (7-day MA)</h3>
            </div>
            <div className="h-64 relative">
              <div className="absolute inset-0 flex items-end gap-1">
                {revenue7dma.length === 0 ? (
                  <p className="text-gray-500">No data</p>
                ) : (
                  (() => {
                    const min = Math.min(...revenue7dma.map((p) => p.v));
                    const max = Math.max(...revenue7dma.map((p) => p.v));
                    return revenue7dma.map((p, i) => (
                      <div key={i} className="flex-1 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-[#FFFFFF] to-[#d8d8d8] rounded-t"
                          style={{ height: `${Math.max(4, normalize(min, max, p.v) * 100)}%` }}
                          title={`${formatCurrency(p.v)}`}
                        />
                      </div>
                    ));
                  })()
                )}
              </div>
            </div>
          </div>

          {/* Ratings Distribution */}
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Ratings Distribution</h3>
            </div>
            <div className="h-64 flex items-end gap-3">
              {([1,2,3,4,5] as const).map((r) => {
                const count = ratingDist[r];
                const max = Math.max(...Object.values(ratingDist));
                const h = max === 0 ? 0 : (count / max) * 100;
                return (
                  <div key={r} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-[#FFFFFF] rounded-t" style={{ height: `${Math.max(6, h)}%` }} />
                    <p className="text-xs text-gray-400 mt-2">{r}★</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-3">Verified share: {(totals.verifiedShare * 100).toFixed(1)}% • Helpful votes: {totals.helpfulTotal}</p>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2"><FunnelIcon className="w-5 h-5"/> Conversion Funnel</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {([
              { label: "Viewed", value: funnel.viewed },
              { label: "Pending", value: funnel.pending },
              { label: "Accepted", value: funnel.accepted },
              { label: "Processing", value: funnel.processing },
              { label: "Delivered", value: funnel.delivered },
            ]).map((s, idx, arr) => {
              const max = Math.max(...arr.map((x) => x.value));
              return (
                <div key={s.label} className="bg-[#0F0F0F] rounded-lg border border-[#2A2A2A] p-4">
                  <div className="text-gray-400 text-sm mb-2">{s.label}</div>
                  <div className="h-6 bg-[#2A2A2A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FFFFFF]" style={{ width: `${max === 0 ? 0 : (s.value / max) * 100}%` }} />
                  </div>
                  <div className="text-white text-sm mt-2 font-mono">{s.value}</div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-3">Note: Derived from order statuses. "Viewed" approximated.</p>
        </div>

        {/* Pie-ish breakdown (status share) */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2"><ChartPieIcon className="w-5 h-5"/> Order Status Share</h3>
          </div>
          <div className="flex gap-6 items-center">
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
              {(() => {
                const total = orders.length || 1;
                const counts: Record<string, number> = {};
                orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
                return Object.entries(counts).map(([status, count]) => (
                  <div key={status} className="bg-[#0F0F0F] rounded-lg border border-[#2A2A2A] p-4">
                    <div className="text-gray-400 text-sm capitalize">{status}</div>
                    <div className="text-white text-xl font-bold">{((count/total)*100).toFixed(1)}%</div>
                    <div className="text-gray-500 text-xs">{count} orders</div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
