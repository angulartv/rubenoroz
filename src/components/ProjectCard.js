import { ExternalLink, Info } from 'lucide-react';

export default function ProjectCard({ project }) {
    return (
        <div className="card" style={{
            background: 'var(--card-bg)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s, box-shadow 0.2s',
            height: '100%'
        }}>
            <div className="preview" style={{
                background: 'var(--secondary-bg)',
                height: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--muted)',
                fontSize: '13px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {project.preview ? (
                    <img src={project.preview} alt={project.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <img
                        src={`https://s0.wp.com/mshots/v1/${encodeURIComponent(project.url)}?w=600&h=400`}
                        alt={`Preview of ${project.name}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'block';
                        }}
                    />
                )}
                <span style={{ display: 'none', position: 'absolute' }}>Preview unavailable</span>
            </div>

            <div className="card-body" style={{ padded: '16px', flex: 1, display: 'flex', flexDirection: 'column', padding: '16px' }}>
                <div style={{ marginBottom: '10px' }}>
                    <span className="tag" style={{
                        display: 'inline-block',
                        background: 'var(--tag-bg)',
                        color: 'var(--tag-text)',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        width: 'fit-content'
                    }}>
                        {project.category} {project.tags && project.tags.length > 0 && `· ${project.tags[0]}`}
                    </span>
                </div>

                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px' }}>{project.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px', flex: 1, lineHeight: '1.4' }}>
                    {project.description}
                </p>

                <div className="card-actions" style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn" style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}>
                        <ExternalLink size={14} /> Visitar
                    </a>
                    <button className="btn secondary" style={{ padding: '10px' }}>
                        <Info size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
