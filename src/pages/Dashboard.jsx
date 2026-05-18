import React from 'react';
import { motion } from 'framer-motion';
import { 
  Funnel, 
  Plus, 
  CaretDown, 
  X, 
  ArrowUp, 
  ArrowDown, 
  DotsThree,
  ArrowRight,
  Pants,
  TShirt,
  Users
} from '@phosphor-icons/react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import { Card, CardHeader, StatValue, Badge, Pill } from '../components/ui/StatCard';
import { 
  mockOverview, 
  mockAppointments, 
  mockRevenue, 
  mockAnalytics, 
  mockTotalVisits, 
  mockTopTreatments 
} from '../data/mockData';

// Theme Colors
const colorPrimary = '#4F46E5';
const colorPrimaryLight = '#EEF2FF';

// Custom Animated Components
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4 mb-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="dash-title"
        >
          <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
          <p className="text-text-muted text-sm">Track clinic performance and appointments</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-3"
        >
          <button className="h-10 px-4 rounded-xl border border-border-color bg-bg-card flex items-center gap-2 text-sm font-medium hover:bg-bg-body transition-colors">
            <Funnel size={16} /> Filters
          </button>
          <button className="h-10 px-4 rounded-xl bg-text-main text-white flex items-center gap-2 text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
            <Plus size={16} weight="bold" /> Add Widget
          </button>
        </motion.div>
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4 pb-10"
      >
        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card colSpan={2} className="md:col-span-2 xl:col-span-2">
            <CardHeader title="Patient overview">
              <select className="border border-border-color py-1 px-2 rounded-md text-xs bg-bg-card outline-none">
                <option>This month</option>
              </select>
            </CardHeader>
            <div className="flex justify-between items-end">
              <StatValue value={mockOverview.totalPatients.toLocaleString()} sub="Total patients" />
              <div className="text-xs text-text-muted flex items-center gap-1">
                New patients: {mockOverview.newPatients} <CaretDown size={12} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Pill active variant="primary">Cosmetics <X size={12} /></Pill>
              <Pill active variant="light">Housewares <X size={12} /></Pill>
            </div>
          </Card>

          <Card>
            <CardHeader title="Appointments" />
            <StatValue value={mockAppointments.value} sub="vs last month">
              <Badge variant="green"><ArrowUp size={10} weight="bold" /> {mockAppointments.percentChange}%</Badge>
            </StatValue>
            <div className="h-16 w-full mt-auto min-h-0 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockAppointments.chartData}>
                  <Bar dataKey="value" fill={colorPrimaryLight} radius={[4, 4, 4, 4]} barSize={8}>
                    {mockAppointments.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 1 ? colorPrimary : colorPrimaryLight} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader title="Daily Revenue" />
            <StatValue value={`₹${mockRevenue.value.toLocaleString()}`} sub="vs last month">
              <Badge variant="green"><ArrowUp size={10} weight="bold" /> {mockRevenue.percentChange}%</Badge>
            </StatValue>
            <div className="h-16 w-full mt-auto flex justify-end items-center min-h-0 min-w-0">
              <div className="w-14 h-14">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockRevenue.chartData}
                      innerRadius="70%"
                      outerRadius="100%"
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={colorPrimary} />
                      <Cell fill={colorPrimaryLight} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card colSpan={3} className="md:col-span-2 xl:col-span-3 relative overflow-hidden">
            <CardHeader title="Analytics">
              <div className="flex gap-2">
                <select className="border border-border-color py-1 px-2 rounded-md text-xs bg-bg-card outline-none">
                  <option>This year</option>
                </select>
                <button className="border border-border-color h-7 px-3 rounded-md bg-bg-card flex items-center gap-1.5 text-xs font-medium hover:bg-bg-body">
                  <Funnel size={12} /> Filters
                </button>
              </div>
            </CardHeader>
            <div className="flex justify-between mb-2">
              <div>
                <div className="text-xl font-bold flex items-center gap-2">
                  ₹{Math.abs(mockAnalytics.revenue).toLocaleString()}
                  <Badge variant="green" className="text-[9px]">↑ {Math.abs(mockAnalytics.revenueChange)}%</Badge>
                </div>
                <div className="text-xs text-text-muted">Revenue</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold flex items-center justify-end gap-2">
                  {mockAnalytics.conversionRate}%
                  <Badge variant="green" className="text-[9px]">↑ {mockAnalytics.conversionChange}%</Badge>
                </div>
                <div className="text-xs text-text-muted">Conv. rate</div>
              </div>
            </div>
            <div className="h-48 w-full -ml-4 min-h-0 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockAnalytics.chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colorPrimary} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={colorPrimary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    cursor={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visits" 
                    stroke={colorPrimary} 
                    strokeWidth={2}
                    dot={{ r: 4, fill: colorPrimary, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="md:col-span-2 xl:col-span-1">
            <CardHeader title="Treatment Breakdown" />
            <div className="h-36 w-full flex justify-center items-center relative min-h-0 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockRevenue.chartData}
                    startAngle={180}
                    endAngle={0}
                    innerRadius="80%"
                    outerRadius="100%"
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill={colorPrimary} />
                    <Cell fill={colorPrimaryLight} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center mt-8">
                <span className="text-xl font-bold">75%</span>
                <span className="text-[10px] text-text-muted">Paid ratio</span>
              </div>
            </div>
            <div className="mt-auto pt-2">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-medium flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-primary"></div> Total Treatments</span>
                <span className="text-text-muted">For week</span>
              </div>
              <div className="flex justify-between text-xs mb-4">
                <span className="font-medium flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-primary-light"></div> Average Value</span>
                <span className="text-text-muted">For today</span>
              </div>
              <div className="text-center text-[13px] font-medium text-text-main hover:text-primary cursor-pointer flex items-center justify-center gap-1 transition-colors">
                See Details <ArrowRight size={14} />
              </div>
            </div>
          </Card>
        </div>

        {/* ROW 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="md:col-span-2 xl:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center">
                <DotsThree size={24} weight="bold" />
              </div>
              <div>
                <div className="text-xs text-text-muted flex items-center gap-1">Total visits by hourly <Funnel size={10} /></div>
                <div className="text-xl font-bold flex items-center gap-2">
                  {mockTotalVisits.total.toLocaleString()}
                  <Badge variant="green" className="text-[9px]">↑ {mockTotalVisits.percentChange}%</Badge>
                </div>
              </div>
            </div>
            
            {/* CSS Grid Heatmap Simulation */}
            <div className="grid grid-cols-[auto_1fr] gap-2 text-[10px] text-text-muted mt-2">
              <div className="flex flex-col justify-around h-full gap-2 py-1">
                <span>MON</span><span>TUE</span><span>WED</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {/* Mon */}
                <div className="col-span-2 bg-primary rounded h-4"></div>
                <div className="bg-primary-light rounded h-4"></div>
                <div className="bg-primary-light rounded h-4"></div>
                <div className="bg-bg-body rounded h-4"></div>
                {/* Tue */}
                <div className="bg-primary-light rounded h-4"></div>
                <div className="bg-primary-light rounded h-4"></div>
                <div className="bg-bg-body rounded h-4"></div>
                <div className="col-span-2 bg-primary-light rounded h-4"></div>
                {/* Wed */}
                <div className="bg-primary-light rounded h-4"></div>
                <div className="bg-bg-body rounded h-4"></div>
                <div className="col-span-2 bg-primary rounded h-4"></div>
                <div className="bg-primary-light rounded h-4"></div>
              </div>
            </div>
          </Card>

          <Card colSpan={3} className="md:col-span-2 xl:col-span-3">
            <CardHeader title="Top Treatments">
              <span className="text-primary font-medium text-[13px] hover:underline cursor-pointer flex items-center gap-1">
                See Details <ArrowRight size={14} />
              </span>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left border-collapse">
                <thead>
                  <tr className="text-text-muted border-b border-border-color">
                    <th className="font-medium pb-3 pr-2">Treatment</th>
                    <th className="font-medium pb-3 px-2">Count</th>
                    <th className="font-medium pb-3 px-2">Revenue</th>
                    <th className="font-medium pb-3 pl-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTopTreatments.map((t) => (
                    <motion.tr 
                      whileHover={{ backgroundColor: 'var(--color-bg-body)' }}
                      key={t.id} 
                      className="border-b border-border-color last:border-none group cursor-pointer transition-colors"
                    >
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-3 font-medium text-text-main">
                          <div className="w-8 h-8 rounded-lg bg-bg-body flex items-center justify-center text-text-muted group-hover:bg-bg-card transition-colors">
                            <Users size={18} />
                          </div>
                          {t.name}
                        </div>
                      </td>
                      <td className="py-3 px-2">{t.count}</td>
                      <td className="py-3 px-2 text-text-main font-medium">₹{t.revenue.toLocaleString()}</td>
                      <td className="py-3 pl-2">
                        <span className={`px-2 py-1 rounded text-[11px] font-medium ${
                          t.status === 'High Demand'
                            ? 'bg-primary/15 text-primary'
                            : 'bg-emerald-900/30 text-emerald-400'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </motion.div>
    </AppLayout>
  );
}
