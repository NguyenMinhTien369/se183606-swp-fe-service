import React, { useState, useEffect } from 'react';
import { useAuth } from '@/pages/Login/feature/AuthContext';
import type { Stats, Claim, TrendData, CampaignStat } from './types';
import {
    FaTachometerAlt, FaClipboardList, FaBullhorn,
    FaCheckCircle, FaClock, FaTimes, FaExclamationTriangle,
    FaChartLine, FaTools
} from 'react-icons/fa';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './EVMDashboard.module.css';

const EVMDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats] = useState<Stats>({
        totalClaims: 156,
        pendingClaims: 23,
        approvedClaims: 118,
        rejectedClaims: 15,
        activeCampaigns: 8,
        totalParts: 245,
        lowStockParts: 12
    });
    const [recentClaims, setRecentClaims] = useState<Claim[]>([]);
    const [claimTrends, setClaimTrends] = useState<TrendData[]>([]);
    const [campaignStats, setCampaignStats] = useState<CampaignStat[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setRecentClaims([
                {
                    id: 1,
                    claimNumber: 'CLM-2024-001',
                    customer: { fullName: 'John Smith' },
                    vehicle: { model: 'EV Model X', vin: 'VIN123456' },
                    status: 'PENDING',
                    createdDate: new Date().toISOString()
                },
                {
                    id: 2,
                    claimNumber: 'CLM-2024-002',
                    customer: { fullName: 'Jane Doe' },
                    vehicle: { model: 'EV Model Y', vin: 'VIN789012' },
                    status: 'APPROVED',
                    createdDate: new Date().toISOString()
                }
            ]);

            setClaimTrends([
                { month: 'Jan', claims: 45, approved: 40 },
                { month: 'Feb', claims: 52, approved: 48 },
                { month: 'Mar', claims: 48, approved: 45 },
                { month: 'Apr', claims: 61, approved: 56 },
                { month: 'May', claims: 55, approved: 52 },
                { month: 'Jun', claims: 67, approved: 63 }
            ]);

            setCampaignStats([
                { name: 'Active', value: 8, color: '#10b981' },
                { name: 'Completed', value: 15, color: '#3b82f6' },
                { name: 'Pending', value: 5, color: '#f59e0b' }
            ]);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; className: string; icon: any }> = {
            PENDING: { label: 'Pending', className: styles.statusPending, icon: FaClock },
            APPROVED: { label: 'Approved', className: styles.statusApproved, icon: FaCheckCircle },
            REJECTED: { label: 'Rejected', className: styles.statusRejected, icon: FaTimes },
            IN_PROGRESS: { label: 'In Progress', className: styles.statusInProgress, icon: FaExclamationTriangle },
            COMPLETED: { label: 'Completed', className: styles.statusCompleted, icon: FaCheckCircle }
        };
        const { label, className, icon: Icon } = config[status] || config.PENDING;
        return <span className={`${styles.statusBadge} ${className}`}><Icon /> {label}</span>;
    };

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        <h1>
                            <FaTachometerAlt />
                            EVM Staff Dashboard
                        </h1>
                        <p>Welcome, {user?.fullName || 'EVM Staff'}!</p>
                    </div>
                    <div className={styles.headerRight}>
                        <p>Today</p>
                        <p>{new Date().toLocaleDateString('en-US')}</p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard} style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className={styles.statIcon} style={{ background: '#fef3c7' }}>
                        <FaClock style={{ color: '#f59e0b' }} />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.pendingClaims}</h3>
                        <p>Pending Approval</p>
                    </div>
                </div>

                <div className={styles.statCard} style={{ borderLeft: '4px solid #10b981' }}>
                    <div className={styles.statIcon} style={{ background: '#d1fae5' }}>
                        <FaCheckCircle style={{ color: '#10b981' }} />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.approvedClaims}</h3>
                        <p>Approved Claims</p>
                    </div>
                </div>

                <div className={styles.statCard} style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className={styles.statIcon} style={{ background: '#dbeafe' }}>
                        <FaBullhorn style={{ color: '#3b82f6' }} />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.activeCampaigns}</h3>
                        <p>Active Campaigns</p>
                    </div>
                </div>

                <div className={styles.statCard} style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className={styles.statIcon} style={{ background: '#fee2e2' }}>
                        <FaTools style={{ color: '#ef4444' }} />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.lowStockParts}</h3>
                        <p>Low Stock Parts</p>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className={styles.chartsGrid}>
                {/* Claim Trends Chart */}
                <div className={styles.chartCard}>
                    <h2 className={styles.chartTitle}>
                        <FaChartLine />
                        Warranty Claims Trends
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={claimTrends}>
                            <defs>
                                <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="claims" stroke="#14b8a6" fillOpacity={1} fill="url(#colorClaims)" name="Claims" />
                            <Area type="monotone" dataKey="approved" stroke="#10b981" fillOpacity={1} fill="url(#colorApproved)" name="Approved" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Campaign Stats Chart */}
                <div className={styles.chartCard}>
                    <h2 className={styles.chartTitle}>
                        <FaBullhorn />
                        Campaign Statistics
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={campaignStats}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {campaignStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Claims Table */}
            <div className={styles.tableCard}>
                <h2 className={styles.tableTitle}>
                    <FaClipboardList />
                    Recent Warranty Claims
                </h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Claim Number</th>
                                <th>Customer</th>
                                <th>Vehicle</th>
                                <th>Created Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentClaims.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className={styles.noData}>
                                        No data available
                                    </td>
                                </tr>
                            ) : (
                                recentClaims.map((claim) => (
                                    <tr key={claim.id}>
                                        <td className={styles.claimNumber}>{claim.claimNumber}</td>
                                        <td>{claim.customer?.fullName}</td>
                                        <td>
                                            <div>{claim.vehicle?.model}</div>
                                            <small>{claim.vehicle?.vin}</small>
                                        </td>
                                        <td>{new Date(claim.createdDate).toLocaleDateString('en-US')}</td>
                                        <td>{getStatusBadge(claim.status)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EVMDashboard;
