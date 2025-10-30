import React from 'react';
import { BarChart } from 'lucide-react';

const Analytics: React.FC = () => {
    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <BarChart size={64} style={{ color: '#9ca3af', margin: '0 auto' }} />
                <h1 style={{ fontSize: '2rem', marginTop: '1.5rem', color: '#1a1a1a' }}>
                    Analytics
                </h1>
                <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '1.125rem' }}>
                    This page is under construction. Coming soon...
                </p>
            </div>
        </div>
    );
};

export default Analytics;
