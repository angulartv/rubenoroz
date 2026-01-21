'use client';

import { useState, useEffect } from 'react';
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
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest
  const [filterType, setFilterType] = useState('All');

  const router = useRouter();

  useEffect(() => {
    fetchProjects();
    checkAuth();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [projects, sortOrder, filterType]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' });
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
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

    // Filter
    if (filterType !== 'All') {
      result = result.filter(p => p.category === filterType);
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredProjects(result);
  };

  const handleToggleAdmin = () => {
    if (isAdmin) {
      // Optional: Logout logic here if clicking the button again
      // For now, let's just keep it simple or maybe redirect to login if not logged in
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

  const handleSort = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const handleFilter = () => {
    // Simple toggle for demo, could be a dropdown
    const types = ['All', 'Web', 'App', 'Media', 'Experimental'];
    const currentIndex = types.indexOf(filterType);
    const nextIndex = (currentIndex + 1) % types.length;
    setFilterType(types[nextIndex]);
  };

  return (
    <>
      <Header />
      <main className="container">
        <FilterBar
          onSort={handleSort}
          onFilter={handleFilter}
          onToggleAdmin={isAdmin ? handleLogout : handleToggleAdmin}
          isAdmin={isAdmin}
        />

        <div style={{ paddingBottom: '16px', fontSize: '13px', color: 'var(--muted)' }}>
          Showing: <strong>{filterType}</strong> · Sort: <strong>{sortOrder}</strong>
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
