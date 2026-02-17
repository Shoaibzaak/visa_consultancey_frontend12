import React from 'react';
import { ShieldAlert, Clock } from 'lucide-react';

const Maintenance = () => {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                padding: '60px',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                maxWidth: '500px',
                width: '100%'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '24px',
                    color: '#0066A1'
                }}>
                    <ShieldAlert size={80} strokeWidth={1.5} />
                </div>

                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    color: '#1e293b',
                    marginBottom: '16px'
                }}>
                    System Under Maintenance
                </h1>

                <p style={{
                    color: '#64748b',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    marginBottom: '32px'
                }}>
                    We are currently performing scheduled maintenance to improve our services.
                    The application is temporarily unavailable.
                </p>

                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '100px',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: '600'
                }}>
                    <Clock size={16} />
                    Please check back later
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
