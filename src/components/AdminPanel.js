import { useState } from 'react';
import { Trash2, Plus, Edit2, X } from 'lucide-react';

export default function AdminPanel({ projects, onAdd, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        url: '',
        description: '',
        category: 'Web',
        tags: '',
        preview: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        if (isEditing) {
            onUpdate({ ...data, id: editId });
            cancelEdit();
        } else {
            onAdd(data);
            resetForm();
        }
    };

    const startEdit = (project) => {
        setIsEditing(true);
        setEditId(project.id);
        setFormData({
            name: project.name,
            url: project.url,
            description: project.description,
            category: project.category,
            tags: project.tags ? project.tags.join(', ') : '',
            preview: project.preview || ''
        });
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({ name: '', url: '', description: '', category: 'Web', tags: '', preview: '' });
    };

    return (
        <div className="admin-panel" style={{
            marginTop: '40px',
            padding: '24px',
            background: '#ffffff',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--card-shadow)',
            maxWidth: '500px',
            margin: '40px auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Admin · {isEditing ? 'Edit Project' : 'Add Project'}</h3>
                {isEditing && (
                    <button type="button" onClick={cancelEdit} className="btn secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                        <X size={12} /> Cancel
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <input
                    className="input"
                    placeholder="Project Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ marginBottom: '10px' }}
                />
                <input
                    className="input"
                    placeholder="Subdomain / URL"
                    value={formData.url}
                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                    required
                    type="url"
                    style={{ marginBottom: '10px' }}
                />
                <input
                    className="input"
                    placeholder="Short Description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    required
                    style={{ marginBottom: '10px' }}
                />
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <select
                        className="select"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="Web">Web</option>
                        <option value="App">App</option>
                        <option value="Experimental">Experimental</option>
                        <option value="Media">Media</option>
                    </select>
                    <input
                        className="input"
                        placeholder="Tags (comma separated)"
                        value={formData.tags}
                        onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    />
                </div>
                <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                    {isEditing ? <Edit2 size={16} /> : <Plus size={16} />}
                    {isEditing ? ' Update Project' : ' Save Project'}
                </button>
            </form>

            <div style={{ marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0' }}>Manage Existing</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {projects.map(p => (
                        <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '13px' }}>
                            <span style={{ fontWeight: isEditing && editId === p.id ? 'bold' : 'normal' }}>{p.name}</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => startEdit(p)}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(p.id)}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
