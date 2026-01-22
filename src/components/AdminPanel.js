import { useState, useEffect } from 'react';
import { Trash2, Plus, Edit2, X, GripVertical } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
function SortableItem(props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        fontSize: '13px',
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '8px 12px',
        touchAction: 'none' // Important for pointer events
    };

    return (
        <li ref={setNodeRef} style={style} {...attributes}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div {...listeners} style={{ cursor: 'grab', color: 'var(--muted)' }}>
                    <GripVertical size={14} />
                </div>
                <span style={{ fontWeight: props.isEditing ? 'bold' : 'normal' }}>{props.name}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    type="button"
                    onClick={props.onEdit}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}
                >
                    <Edit2 size={14} />
                </button>
                <button
                    type="button"
                    onClick={props.onDelete}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </li>
    );
}

export default function AdminPanel({ projects, onAdd, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [orderedProjects, setOrderedProjects] = useState([]);

    // Sync local state with props
    useEffect(() => {
        setOrderedProjects(projects);
    }, [projects]);

    const [formData, setFormData] = useState({
        name: '',
        url: '',
        description: '',
        category: 'Web',
        tags: '',
        preview: ''
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setOrderedProjects((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Trigger API update
                saveReorder(newItems);

                return newItems;
            });
        }
    };

    const saveReorder = async (items) => {
        try {
            await fetch('/api/projects/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: items.map(p => ({ id: p.id })) })
            });
        } catch (error) {
            console.error('Failed to save order', error);
        }
    };

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
                <h4 style={{ margin: '0 0 15px 0' }}>Manage Existing (Drag to Reorder)</h4>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={orderedProjects.map(p => p.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {orderedProjects.map(p => (
                                <SortableItem
                                    key={p.id}
                                    id={p.id}
                                    name={p.name}
                                    isEditing={isEditing && editId === p.id}
                                    onEdit={() => startEdit(p)}
                                    onDelete={() => onDelete(p.id)}
                                />
                            ))}
                        </ul>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}
