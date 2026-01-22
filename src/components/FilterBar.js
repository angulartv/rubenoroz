'use client';

import { Search, Tags, Lock, X } from 'lucide-react';

export default function FilterBar({
    searchQuery,
    setSearchQuery,
    selectedTags,
    toggleTag,
    availableTags,
    onToggleAdmin,
    isAdmin
}) {
    return (
        <div className="filter-bar" style={{ marginBottom: '24px' }}>
            {/* Top Row: Search & Admin */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                    position: 'relative',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--secondary-bg)',
                    borderRadius: 'var(--radius)',
                    padding: '0 12px',
                    border: '1px solid var(--border)'
                }}>
                    <Search size={14} style={{ color: 'var(--muted)', marginRight: '8px' }} />
                    <input
                        type="text"
                        placeholder="Buscar proyectos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            height: '40px',
                            width: '100%',
                            fontSize: '14px',
                            color: 'var(--foreground)'
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--muted)',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>

                <button
                    className={`btn ${isAdmin ? 'danger' : 'secondary'}`}
                    onClick={onToggleAdmin}
                    style={{ whiteSpace: 'nowrap' }}
                >
                    <Lock size={14} />
                </button>
            </div>

            {/* Bottom Row: Tags Scroll */}
            {availableTags && availableTags.length > 0 && (
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none'  // IE 10+
                }} className="no-scrollbar">
                    <style jsx>{`
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                    {availableTags.map(tag => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                style={{
                                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                                    background: isSelected ? 'var(--primary-light)' : 'var(--card-bg)',
                                    color: isSelected ? 'var(--primary)' : 'var(--muted)',
                                    borderRadius: '999px',
                                    padding: '6px 14px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s',
                                    fontWeight: isSelected ? '500' : 'normal'
                                }}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
