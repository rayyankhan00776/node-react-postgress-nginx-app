import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  FolderArchive, 
  Trash2, 
  Edit, 
  ArrowRight,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 6, totalPages: 1 });
  
  // Query Filters State
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('active'); // active, archived, all
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, delete
  const [selectedProject, setSelectedProject] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch Projects List
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects', {
        params: {
          search,
          filter,
          sortBy,
          sortOrder,
          page,
          limit: 6
        }
      });
      if (response.data?.status === 'success') {
        setProjects(response.data.data.projects);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to fetch projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, filter, sortBy, sortOrder, page]);

  // Reset pagination on filter/search change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(1);
  };

  // Open Create Form
  const openCreateModal = () => {
    setModalMode('create');
    setName('');
    setDescription('');
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  // Open Edit Form
  const openEditModal = (project, e) => {
    e.stopPropagation();
    setModalMode('edit');
    setSelectedProject(project);
    setName(project.name);
    setDescription(project.description || '');
    setIsModalOpen(true);
  };

  // Open Delete Confirm
  const openDeleteModal = (project, e) => {
    e.stopPropagation();
    setModalMode('delete');
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (modalMode !== 'delete' && !name.trim()) return;

    setActionLoading(true);
    setError('');

    try {
      if (modalMode === 'create') {
        await api.post('/projects', { name, description });
      } else if (modalMode === 'edit') {
        await api.put(`/projects/${selectedProject.id}`, { name, description });
      } else if (modalMode === 'delete') {
        await api.delete(`/projects/${selectedProject.id}`);
      }

      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      console.error(`Error during project ${modalMode}:`, err);
      setError(err.response?.data?.message || `Failed to ${modalMode} project.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Archive Project Toggle
  const handleArchiveToggle = async (project, e) => {
    e.stopPropagation();
    try {
      if (project.is_archived) {
        // Unarchive (using update route)
        await api.put(`/projects/${project.id}`, { is_archived: false });
      } else {
        // Archive
        await api.patch(`/projects/${project.id}/archive`);
      }
      fetchProjects();
    } catch (err) {
      console.error('Error toggling archive status:', err);
      setError('Failed to update project status.');
    }
  };

  return (
    <div className="animate-fade">
      {/* Top action header */}
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Create workspaces, structure scopes, and organize tasks
        </p>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Query Filters Dashboard */}
      <div 
        className="glass-card" 
        style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '28px' }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dark)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search projects..."
            value={search}
            onChange={handleSearchChange}
            style={{ paddingLeft: '38px', paddingRight: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Status filter */}
          <div className="flex-center" style={{ gap: '6px' }}>
            <SlidersHorizontal size={14} style={{ color: 'var(--text-dark)' }} />
            <select className="form-control form-select" value={filter} onChange={handleFilterChange} style={{ width: '130px', padding: '8px 12px' }}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All Projects</option>
            </select>
          </div>

          {/* Sort By Column */}
          <select className="form-control form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '150px', padding: '8px 12px' }}>
            <option value="created_at">Date Created</option>
            <option value="name">Project Name</option>
            <option value="updated_at">Recently Active</option>
          </select>

          {/* Sort Order */}
          <select className="form-control form-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ width: '110px', padding: '8px 12px' }}>
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>
      </div>

      {/* Projects Cards Area */}
      {loading ? (
        <div className="grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <>
          <div className="grid-cols-3">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="glass-card" 
                style={{ padding: '24px', position: 'relative', cursor: 'pointer', opacity: project.is_archived ? 0.7 : 1 }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                {project.is_archived && (
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: 'var(--warning)',
                    fontSize: '0.65rem',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <FolderArchive size={10} /> Archived
                  </span>
                )}

                <div className="flex-center" style={{ gap: '10px', color: 'var(--primary)', marginBottom: '14px' }}>
                  <FolderOpen size={20} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', paddingRight: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {project.name}
                  </h3>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', minHeight: '40px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.description || 'No description provided for this project.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </span>
                  
                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={(e) => openEditModal(project, e)} 
                      className="btn-icon" 
                      title="Edit project"
                      style={{ padding: '6px' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={(e) => handleArchiveToggle(project, e)} 
                      className="btn-icon" 
                      title={project.is_archived ? 'Activate project' : 'Archive project'}
                      style={{ padding: '6px', color: project.is_archived ? 'var(--warning)' : 'inherit' }}
                    >
                      <FolderArchive size={14} />
                    </button>
                    <button 
                      onClick={(e) => openDeleteModal(project, e)} 
                      className="btn-icon" 
                      title="Delete project"
                      style={{ padding: '6px', color: 'var(--danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-btn" 
                onClick={() => setPage((p) => Math.max(1, p - 1))} 
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map((pNum) => (
                <button 
                  key={pNum} 
                  className={`page-btn ${page === pNum ? 'active' : ''}`}
                  onClick={() => setPage(pNum)}
                >
                  {pNum}
                </button>
              ))}

              <button 
                className="page-btn" 
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} 
                disabled={page === pagination.totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }} className="glass-card">
          <FolderOpen size={48} style={{ color: 'var(--text-dark)', marginBottom: '16px' }} />
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>No projects found</h3>
          <p style={{ fontSize: '0.9rem' }}>Try modifying your filter options or add a new workspace to start tracking.</p>
          <button onClick={openCreateModal} className="btn btn-primary" style={{ marginTop: '20px' }}>
            <Plus size={16} /> Create Project
          </button>
        </div>
      )}

      {/* Create / Edit / Delete Modal dialogs */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'create' ? 'Create Project' : 
          modalMode === 'edit' ? 'Edit Project' : 
          'Confirm Deletion'
        }
      >
        {modalMode === 'delete' ? (
          <form onSubmit={handleFormSubmit}>
            <p style={{ fontSize: '0.95rem', marginBottom: '24px', color: 'var(--text-muted)' }}>
              Are you sure you want to delete <strong>{selectedProject?.name}</strong>? This action is permanent and will delete all related boards and tasks.
            </p>
            <div style={{ display: 'flex', justifySelf: 'end', gap: '12px' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" disabled={actionLoading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="proj-name">Project Name</label>
              <input
                id="proj-name"
                type="text"
                className="form-control"
                placeholder="e.g. Website Redesign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={150}
                required
                disabled={actionLoading}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label" htmlFor="proj-desc">Description</label>
              <textarea
                id="proj-desc"
                className="form-control"
                placeholder="Scope, objectives, and milestones..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                disabled={actionLoading}
              />
            </div>

            <div style={{ display: 'flex', justifySelf: 'end', gap: '12px' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" disabled={actionLoading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Saving...' : modalMode === 'create' ? 'Create Project' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Projects;
