import React from 'react';
import { Users, Wrench, CheckCircle, Clock } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './SCStaffDashboard.module.css';

const SCStaffDashboard: React.FC = () => {
    // Mock data for charts
    const customerTrendData = [
        { month: 'Jan', customers: 45 },
        { month: 'Feb', customers: 52 },
        { month: 'Mar', customers: 48 },
        { month: 'Apr', customers: 61 },
        { month: 'May', customers: 55 },
        { month: 'Jun', customers: 67 },
    ];

    const warrantyStatusData = [
        { name: 'Pending', value: 12, color: '#f59e0b' },
        { name: 'In Progress', value: 8, color: '#3b82f6' },
        { name: 'Completed', value: 25, color: '#10b981' },
        { name: 'Cancelled', value: 3, color: '#ef4444' },
    ];

    const recentWarranties = [
        { id: 'WR-001', customer: 'Nguyễn Văn A', vehicle: 'Tesla Model 3', status: 'In Progress', date: '2025-10-28' },
        { id: 'WR-002', customer: 'Trần Thị B', vehicle: 'VinFast VF8', status: 'Pending', date: '2025-10-29' },
        { id: 'WR-003', customer: 'Lê Văn C', vehicle: 'BYD Atto 3', status: 'Completed', date: '2025-10-27' },
    ];

    const stats = [
        { title: 'Total Customers', value: '156', icon: <Users size={24} />, color: '#3b82f6', change: '+12%' },
        { title: 'Active Warranties', value: '48', icon: <CheckCircle size={24} />, color: '#10b981', change: '+8%' },
        { title: 'Pending Requests', value: '12', icon: <Clock size={24} />, color: '#f59e0b', change: '-5%' },
        { title: 'Assigned Technicians', value: '8', icon: <Wrench size={24} />, color: '#8b5cf6', change: '+2' },
    ];

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.title}>SC Staff Dashboard</h1>
                        <p className={styles.subtitle}>Welcome back! Here's your service center overview</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.statCardHeader}>
                            <div className={styles.statIcon} style={{ backgroundColor: stat.color }}>
                                {stat.icon}
                            </div>
                            <span className={styles.statChange} style={{ color: stat.change.startsWith('+') ? '#10b981' : '#ef4444' }}>
                                {stat.change}
                            </span>
                        </div>
                        <div className={styles.statTitle}>{stat.title}</div>
                        <div className={styles.statValue}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className={styles.chartsGrid}>
                {/* Customer Trend Chart */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Customer Registration Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={customerTrendData}>
                            <defs>
                                <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Area type="monotone" dataKey="customers" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCustomers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Warranty Status Distribution */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Warranty Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={warrantyStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {warrantyStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Warranties Table */}
            <div className={styles.tableCard}>
                <h3 className={styles.tableTitle}>Recent Warranty Requests</h3>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Warranty ID</th>
                                <th>Customer</th>
                                <th>Vehicle</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentWarranties.map((warranty) => (
                                <tr key={warranty.id}>
                                    <td className={styles.warrantyId}>{warranty.id}</td>
                                    <td>{warranty.customer}</td>
                                    <td>{warranty.vehicle}</td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[`badge${warranty.status.replace(' ', '')}`]}`}>
                                            {warranty.status}
                                        </span>
                                    </td>
                                    <td>{warranty.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SCStaffDashboard;
