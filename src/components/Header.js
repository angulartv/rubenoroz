export default function Header() {
    return (
        <header style={{
            background: 'var(--header-bg)',
            color: 'var(--header-text)',
            padding: '20px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 600 }}>Project Hub</h1>
                <span style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>Landing de subdominios · Vista curatorial</span>
            </div>
            <div>
                {/* Placeholder for future specific header actions or logo */}
            </div>
        </header>
    );
}
