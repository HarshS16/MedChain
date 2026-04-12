"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Heart, 
  Droplets, 
  Clock, 
  AlertCircle,
  Calendar,
  Filter,
  Download
} from "lucide-react";

const dummyTrendData = [
  { date: "2024-01", bloodSugar: 105, bp: 120, heartRate: 72, cholesterol: 180 },
  { date: "2024-02", bloodSugar: 112, bp: 128, heartRate: 75, cholesterol: 185 },
  { date: "2024-03", bloodSugar: 98, bp: 118, heartRate: 70, cholesterol: 175 },
  { date: "2024-04", bloodSugar: 125, bp: 135, heartRate: 82, cholesterol: 195 },
  { date: "2024-05", bloodSugar: 110, bp: 122, heartRate: 74, cholesterol: 182 },
];

const metrics = [
  { id: "bloodSugar", label: "Blood Sugar", icon: Droplets, color: "#EF4444", unit: "mg/dL", trend: "+5%" },
  { id: "bp", label: "Blood Pressure", icon: Activity, color: "#6366F1", unit: "mmHg", trend: "-2%" },
  { id: "heartRate", label: "Heart Rate", icon: Heart, color: "#EC4899", unit: "bpm", trend: "Stable" },
  { id: "cholesterol", label: "Cholesterol", icon: AlertCircle, color: "#F59E0B", unit: "mg/dL", trend: "-3%" },
];

export default function TrendsPage() {
  const [activeMetric, setActiveMetric] = useState(metrics[0]);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 px-2 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest shadow-sm border border-indigo-100/50">Historical Insights</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Health Trend Analysis
            <TrendingUp className="w-8 h-8 text-indigo-600" />
          </h1>
          <p className="text-slate-500 font-medium mt-1">Deep analysis of your health metrics from the previous 5 clinical reports.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Calendar className="w-4 h-4" />
            <span>Last 5 Reports</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
            <Download className="w-4 h-4" />
            <span>Export Analysis</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric) => {
          const isActive = activeMetric.id === metric.id;
          return (
            <motion.button
              key={metric.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveMetric(metric)}
              className={`p-5 rounded-3xl text-left transition-all border ${
                isActive 
                  ? "bg-white border-indigo-200 shadow-[0_10px_40px_rgba(79,70,229,0.1)]" 
                  : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isActive ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-400"}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-black ${metric.trend.startsWith('+') ? 'text-red-500' : metric.trend === 'Stable' ? 'text-slate-400' : 'text-emerald-500'}`}>
                  {metric.trend.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : metric.trend.startsWith('-') ? <TrendingDown className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {metric.trend}
                </div>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{metric.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-800 tracking-tight">
                  {dummyTrendData[dummyTrendData.length - 1][metric.id as keyof typeof dummyTrendData[0]]}
                </span>
                <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">{metric.unit}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{activeMetric.label} Progression</h2>
              <p className="text-sm text-slate-400 font-medium">Monthly trend based on recent report acquisitions</p>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl">
              <button className="px-3 py-1.5 text-xs font-bold bg-white text-indigo-600 rounded-lg shadow-sm border border-slate-200/50">Line</button>
              <button className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600">Area</button>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dummyTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeMetric.color} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={activeMetric.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }}
                  itemStyle={{ color: activeMetric.color, fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey={activeMetric.id} 
                  stroke={activeMetric.color} 
                  strokeWidth={4}
                  dot={{ r: 6, fill: activeMetric.color, strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-lg">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-4">
                 <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                   <TrendingUp className="w-5 h-5" />
                 </div>
                 <h3 className="font-black text-sm uppercase tracking-widest">AI Observation</h3>
               </div>
               <p className="text-indigo-50 font-medium leading-relaxed mb-4">
                 "Your {activeMetric.label} has shown a 12% fluctuation over the last quarter. While currently stable, the sharp increase in April suggests a potential correlation with dietary changes noted in your records."
               </p>
               <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-md">
                 Discuss with AI Bot
               </button>
             </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Filter className="w-4 h-4 text-slate-400" />
               Clinical Correlates
             </h3>
             <ul className="space-y-4">
                {[
                  { label: "Medication adherence", value: "92%", color: "emerald" },
                  { label: "Metabolic rate", value: "Normal", color: "indigo" },
                  { label: "Inflammation marker", value: "Low", color: "emerald" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50">
                    <span className="text-xs font-bold text-slate-500">{item.label}</span>
                    <span className={`text-xs font-black text-${item.color}-600 bg-${item.color}-50 px-2 py-1 rounded-lg uppercase tracking-wider`}>{item.value}</span>
                  </li>
                ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
