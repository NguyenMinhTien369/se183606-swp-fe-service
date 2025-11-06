import { useState, useEffect } from 'react';
import { useAuth } from '@/pages/Login/feature/AuthContext';
import {
    FaUsers, FaFileAlt, FaBoxOpen, FaCar,
    FaChartLine, FaClipboardList, FaTachometerAlt
} from 'react-icons/fa';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { warrantyClaimAPI, userAPI, productModelAPI, vehicleAPI } from '@/utility';
import styles from './EVMDashboard.module.css';

interface Stats {
    totalUsers: number;
    totalClaims: number;
    totalProducts: number;
    totalVehicles: number;
    pendingClaims: number;
    approvedClaims: number;
    rejectedClaims: number;
    activeTechnicians: number;
}

interface MonthlyData {
    month: string;
    claims: number;
    completed: number;
}

interface ClaimStatus {
    name: string;
    value: number;
    color: string;
}

interface StatCard {
    title: string;
    value: number;
    icon: any;
    color: string;
    change: string;
    changeType: string;
}

export default function EVMDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalClaims: 0,
        totalProducts: 0,
        totalVehicles: 0,
        pendingClaims: 0,
        approvedClaims: 0,
        rejectedClaims: 0,
        activeTechnicians: 0
    });
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [claimsByStatus, setClaimsByStatus] = useState<ClaimStatus[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            console.log('🔍 [EVM] Fetching dashboard data...');

            // Fetch all data in parallel - EVM Staff sees ALL data
            const [usersRes, claimsRes, productsRes, vehiclesRes] = await Promise.all([
                userAPI.getUsers().catch(err => {
                    console.error('Error fetching users:', err);
                    return { data: { result: [] } };
                }),
                warrantyClaimAPI.getAllClaims().catch(err => {
                    console.error('Error fetching claims:', err);
                    return { data: { result: [] } };
                }),
                productModelAPI.getAllProductModels().catch(err => {
                    console.error('Error fetching products:', err);
                    return { data: { result: [] } };
                }),
                vehicleAPI.getAllVehicles().catch(err => {
                    console.error('Error fetching vehicles:', err);
                    return { data: { result: [] } };
                })
            ]);

            const users = usersRes.data.result || [];
            const claims = claimsRes.data.result || [];
            const products = productsRes.data.result || [];
            const vehicles = vehiclesRes.data.result || [];

            console.log('📊 [EVM] Dashboard data loaded:');
            console.log('  Users:', users.length);
            console.log('  Claims:', claims.length);
            console.log('  Products:', products.length);
            console.log('  Vehicles:', vehicles.length);

            // Map status từ tiếng Việt sang tiếng Anh nếu cần
            const mapStatus = (status: string): string => {
                const statusMap: Record<string, string> = {
                    'Chờ duyệt': 'PENDING',
                    'Được chấp nhận': 'APPROVED',
                    'Đã duyệt': 'APPROVED',
                    'Từ chối': 'REJECTED',
                    'Đang xử lý': 'IN_PROGRESS',
                    'Hoàn thành': 'COMPLETED',
                };
                const upperStatus = status?.toUpperCase();
                if (['PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED'].includes(upperStatus)) {
                    return upperStatus;
                }
                return statusMap[status] || status?.toUpperCase() || 'UNKNOWN';
            };

            // Calculate statistics
            const statusCounts = claims.reduce((acc: any, claim: any) => {
                const status = mapStatus(claim.status);
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});

            const pending = statusCounts['PENDING'] || statusCounts['WAITING_FOR_APPROVAL'] || 0;
            const approved = statusCounts['APPROVED'] || 0;
            const rejected = statusCounts['REJECTED'] || 0;

            // Count technicians
            const technicians = users.filter((u: any) =>
                u.role?.roleName === 'ROLE_SC_TECHNICIAN'
            );

            // Calculate monthly data (last 6 months)
            const monthlyStats = calculateMonthlyData(claims);
            setMonthlyData(monthlyStats);

            // Set claims by status for pie chart
            const statusData: ClaimStatus[] = [
                { name: 'Chờ duyệt', value: pending, color: '#f59e0b' },
                { name: 'Đã duyệt', value: approved, color: '#10b981' },
                { name: 'Từ chối', value: rejected, color: '#ef4444' }
            ].filter(item => item.value > 0);

            setClaimsByStatus(statusData);

            setStats({
                totalUsers: users.length,
                totalClaims: claims.length,
                totalProducts: products.length,
                totalVehicles: vehicles.length,
                pendingClaims: pending,
                approvedClaims: approved,
                rejectedClaims: rejected,
                activeTechnicians: technicians.length
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateMonthlyData = (claims: any[]): MonthlyData[] => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const monthlyMap = new Map<string, { claims: number; completed: number }>();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${months[date.getMonth()]}`;
            monthlyMap.set(monthKey, { claims: 0, completed: 0 });
        }

        // Count claims per month
        claims.forEach((claim: any) => {
            if (claim.creationDate) {
                const claimDate = new Date(claim.creationDate);
                const monthKey = months[claimDate.getMonth()];

                if (monthlyMap.has(monthKey)) {
                    const data = monthlyMap.get(monthKey)!;
                    data.claims++;

                    if (claim.status?.toUpperCase() === 'APPROVED' ||
                        claim.status?.toUpperCase() === 'COMPLETED' ||
                        claim.status?.toUpperCase() === 'RESOLVED') {
                        data.completed++;
                    }
                    monthlyMap.set(monthKey, data);
                }
            }
        });

        return Array.from(monthlyMap.entries()).map(([month, data]) => ({
            month,
            claims: data.claims,
            completed: data.completed
        }));
    };

    if (loading) {
        return (
            <div className={styles.dashboard}>
                <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                    Đang tải dữ liệu...
                </div>
            </div>
        );
    }

    const statCards: StatCard[] = [
        {
            title: 'Tổng Khách Hàng',
            value: stats.totalUsers,
            icon: FaUsers,
            color: 'bg-blue-500',
            change: `${stats.activeTechnicians} KTV`,
            changeType: 'info'
        },
        {
            title: 'Yêu cầu bảo hành',
            value: stats.totalClaims,
            icon: FaFileAlt,
            color: 'bg-green-500',
            change: `${stats.pendingClaims} chờ`,
            changeType: 'warning'
        },
        {
            title: 'Sản phẩm',
            value: stats.totalProducts,
            icon: FaBoxOpen,
            color: 'bg-purple-500',
            change: 'Đã đăng ký',
            changeType: 'increase'
        },
        {
            title: 'Xe đăng ký',
            value: stats.totalVehicles,
            icon: FaCar,
            color: 'bg-orange-500',
            change: 'Tổng xe',
            changeType: 'increase'
        }
    ];

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
                        <p>Chào mừng trở lại, {user?.fullName || 'EVM Staff'}!</p>
                    </div>
                    <div className={styles.headerRight}>
                        <p>Hôm nay</p>
                        <p>{new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className={styles.statsGrid}>
                {statCards.map((card, index) => (
                    <div key={index} className={styles.statCard} style={{ color: card.color === 'bg-blue-500' ? '#3b82f6' : card.color === 'bg-green-500' ? '#10b981' : card.color === 'bg-purple-500' ? '#a855f7' : '#f97316' }}>
                        <div className={styles.statCardHeader}>
                            <div className={styles.statIcon} style={{ background: card.color === 'bg-blue-500' ? '#3b82f6' : card.color === 'bg-green-500' ? '#10b981' : card.color === 'bg-purple-500' ? '#a855f7' : '#f97316' }}>
                                <card.icon />
                            </div>
                            <span className={styles.statChange}>
                                {card.change}
                            </span>
                        </div>
                        <h3 className={styles.statTitle}>{card.title}</h3>
                        <p className={styles.statValue}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className={styles.chartsGrid}>
                {/* Area Chart - Claims Trend */}
                <div className={styles.chartCard}>
                    <h2 className={styles.chartTitle}>
                        <FaChartLine />
                        Xu hướng yêu cầu bảo hành
                    </h2>
                    <ResponsiveContainer width='100%' height={300}>
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id='colorClaims' x1='0' y1='0' x2='0' y2='1'>
                                    <stop offset='5%' stopColor='#14b8a6' stopOpacity={0.8} />
                                    <stop offset='95%' stopColor='#14b8a6' stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id='colorCompleted' x1='0' y1='0' x2='0' y2='1'>
                                    <stop offset='5%' stopColor='#10b981' stopOpacity={0.8} />
                                    <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray='3 3' />
                            <XAxis dataKey='month' />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type='monotone' dataKey='claims' stroke='#14b8a6' fillOpacity={1} fill='url(#colorClaims)' name='Yêu cầu' />
                            <Area type='monotone' dataKey='completed' stroke='#10b981' fillOpacity={1} fill='url(#colorCompleted)' name='Hoàn thành' />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart - Claims by Status */}
                <div className={styles.chartCard}>
                    <h2 className={styles.chartTitle}>
                        <FaClipboardList />
                        Trạng thái yêu cầu
                    </h2>
                    <ResponsiveContainer width='100%' height={300}>
                        <PieChart>
                            <Pie
                                data={claimsByStatus}
                                cx='50%'
                                cy='50%'
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill='#8884d8'
                                dataKey='value'
                            >
                                {claimsByStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
