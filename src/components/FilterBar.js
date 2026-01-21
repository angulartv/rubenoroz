import { Filter, ArrowUpDown, Lock } from 'lucide-react';

export default function FilterBar({ onSort, onFilter, onToggleAdmin, isAdmin }) {
    return (
        <div className="controls" style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <button className="btn secondary" onClick={onSort}>
                <ArrowUpDown size={14} /> Ordenar
            </button>
            <button className="btn secondary" onClick={onFilter}>
                <Filter size={14} /> Filtrar
            </button>
            <div style={{ flex: 1 }}></div>
            <button className={`btn ${isAdmin ? 'danger' : 'secondary'}`} onClick={onToggleAdmin}>
                <Lock size={14} /> {isAdmin ? 'Logout' : 'Admin Login'}
            </button>
        </div>
    );
}
