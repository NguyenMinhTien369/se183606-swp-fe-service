import React from 'react';
import { Wrench, ClipboardCheck, Clock, AlertCircle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './TechnicianDashboard.module.css';

const TechnicianDashboard: React.FC = () => {
    // Mock data for charts
    const workloadData = [
        { day: 'Mon', tasks: 8 },
        { day: 'Tue', tasks: 6 },
        { day: 'Wed', tasks: 10 },
        { day: 'Thu', tasks: 7 },
        { day: 'Fri', tasks: 9 },
        { day: 'Sat', tasks: 5 },
    ];

    const completionData = [
        { month: 'Jan', completed: 45 },
        { month: 'Feb', completed: 52 },
        { month: 'Mar', completed: 48 },
        { month: 'Apr', completed: 61 },
        { month: 'May', completed: 55 },
        { month: 'Jun', completed: 67 },
    ];

    const assignedTasks = [
        { id: 'T-001', vehicle: 'Tesla Model 3', issue: 'Battery Check', priority: 'High', deadline: '2025-10-30' },
        { id: 'T-002', vehicle: 'VinFast VF8', issue: 'Motor Inspection', priority: 'Medium', deadline: '2025-10-31' },
        { id: 'T-003', vehicle: 'BYD Atto 3', issue: 'Charging Port Repair', priority: 'Low', deadline: '2025-11-01' },
    ];

    const stats = [
        { title: 'Assigned Tasks', value: '24', icon: <ClipboardCheck size={24} />, color: '#3b82f6', change: '+5' },
        { title: 'In Progress', value: '8', icon: <Wrench size={24} />, color: '#f59e0b', change: '+2' },
        { title: 'Completed Today', value: '12', icon: <ClipboardCheck size={24} />, color: '#10b981', change: '+4' },
        { title: 'Pending Review', value: '4', icon: <Clock size={24} />, color: '#8b5cf6', change: '-1' },
    ];

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.title}>Technician Dashboard</h1>
                        <p className={styles.subtitle}>Track your assigned tasks and performance</p>
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
                {/* Weekly Workload */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Weekly Workload</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={workloadData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="day" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="tasks" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly Completion Trend */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Monthly Completion Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={completionData}>
                            <defs>
                                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fill="url(#colorCompleted)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Assigned Tasks Table */}
            <div className={styles.tableCard}>
                <h3 className={styles.tableTitle}>
                    <AlertCircle size={20} style={{ marginRight: '0.5rem', color: '#f59e0b' }} />
                    Today's Assigned Tasks
                </h3>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Task ID</th>
                                <th>Vehicle</th>
                                <th>Issue</th>
                                <th>Priority</th>
                                <th>Deadline</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedTasks.map((task) => (
                                <tr key={task.id}>
                                    <td className={styles.taskId}>{task.id}</td>
                                    <td>{task.vehicle}</td>
                                    <td>{task.issue}</td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[`badge${task.priority}`]}`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td>{task.deadline}</td>
                                    <td>
                                        <button className={styles.actionButton}>Start Work</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TechnicianDashboard;
