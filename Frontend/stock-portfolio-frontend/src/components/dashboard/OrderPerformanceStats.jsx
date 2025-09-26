import React from 'react'
import { Briefcase, Activity, Clock, CheckCircle, Plus, PieChart, Search, Settings, TrendingUp, DollarSign, Target } from 'lucide-react';
import StatCard from '../ui/StatCard';

export default function OrderPerformanceStats({ stats, loading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard 
                    icon={Activity}
                    title="Total Orders"
                    value={loading ? 'Loading...' : stats.totalOrders}
                    iconColor="blue"
                />

                <StatCard 
                    icon={Clock}
                    title="Pending Orders"
                    value={loading ? 'Loading...' : stats.pendingOrders}
                    iconColor="yellow"
                />

                <StatCard 
                    icon={CheckCircle}
                    title="Filled Orders"
                    value={loading ? 'Loading...' : stats.filledOrders}
                    iconColor="green"
                />
      </div>
  )
}
