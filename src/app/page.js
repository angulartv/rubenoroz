'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import ProjectCard from '@/components/ProjectCard';
import AdminPanel from '@/components/AdminPanel';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const router = useRouter();

  useEffect(() => {
    fetchProjects();
    checkAuth();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [projects, searchQuery, selectedTags]);

  // Derive unique tags from all projects
  const availableTags = useMemo(() => {
    const tags = new Set();
    projects.forEach(p => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(t => tags.add(t));
      }
    });
    return Array.from(tags).sort();
  }, [projects]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' });
      const data = await res.json();

      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        console.error('API returned non-array:', data);
        setProjects([]);
      }
    } catch (error) {
      console.error('Failed to fetch projects', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      setIsAdmin(data.isAuthenticated);
    } catch {
      setIsAdmin(false);
    }
  };

  const applyFilters = () => {
    let result = [...projects];

    // Filter by Search Query (Name or Description)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Filter by Tags
    if (selectedTags.length > 0) {
      result = result.filter(p =>
        p.tags && selectedTags.every(t => p.tags.includes(t))
      );
    }

    // Note: Order is preserved from API (Rank ASC)
    setFilteredProjects(result);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleToggleAdmin = () => {
    if (isAdmin) {
      router.push('/login'); // Or logout logic
    } else {
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAdmin(false);
    router.refresh();
  };

  const handleAddProject = async (projectData) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (res.ok) {
        fetchProjects(); // Reload
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to add project', error);
    }
  };

  const handleUpdateProject = async (projectData) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (res.ok) {
        fetchProjects(); // Reload
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to update project', error);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const res = await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchProjects(); // Reload
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  };

  return (
    <>
      <Header />
      <main className="container">
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          availableTags={availableTags}
          onToggleAdmin={isAdmin ? handleLogout : handleToggleAdmin}
          isAdmin={isAdmin}
        />

        <div style={{ paddingBottom: '16px', fontSize: '13px', color: 'var(--muted)' }}>
          {searchQuery && <span>Searching: <strong>{searchQuery}</strong> </span>}
          {selectedTags.length > 0 && <span>Tags: <strong>{selectedTags.join(', ')}</strong></span>}
          {!searchQuery && selectedTags.length === 0 && <span>All Projects</span>}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>Loading projects...</div>
        ) : (
          <div className="grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {isAdmin && (
          <AdminPanel
            projects={projects}
            onAdd={handleAddProject}
            onUpdate={handleUpdateProject}
            onDelete={handleDeleteProject}
          />
        )}

        <footer style={{ marginTop: '32px', fontSize: '12px', color: 'var(--muted)', textAlign: 'center', paddingBottom: '40px' }}>
          Landing–hub pensada como archivo vivo de proyectos. El público solo navega; el administrador gestiona orden, visibilidad y nuevos subdominios.
        </footer>
      </main>
    </>
  );
}
