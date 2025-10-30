import React from 'react';
import { Megaphone } from 'lucide-react';

const CampaignManagement: React.FC = () => {
    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <Megaphone size={64} style={{ color: '#9ca3af', margin: '0 auto' }} />
                <h1 style={{ fontSize: '2rem', marginTop: '1.5rem', color: '#1a1a1a' }}>
                    Campaign Management
                </h1>
                <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '1.125rem' }}>
                    This page is under construction. Coming soon...
                </p>
            </div>
        </div>
    );
};

export default CampaignManagement;
