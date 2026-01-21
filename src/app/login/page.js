'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push('/');
                router.refresh(); // Refresh to update UI based on cookie
            } else {
                setError('Invalid password');
            }
        } catch (err) {
            setError('Something went wrong');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)'
        }}>
            <div style={{
                background: 'white',
                padding: '32px',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--card-shadow)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h1 style={{ margin: '0 0 24px 0', fontSize: '20px', textAlign: 'center' }}>Admin Login</h1>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                        type="password"
                        className="input"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                    />

                    {error && <div style={{ color: '#ef4444', fontSize: '14px' }}>{error}</div>}

                    <button type="submit" className="btn" style={{ justifyContent: 'center', width: '100%' }}>
                        Login
                    </button>
                </form>

                <a href="/" style={{ display: 'block', textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--muted)' }}>
                    ← Back to Portfolio
                </a>
            </div>
        </div>
    );
}
