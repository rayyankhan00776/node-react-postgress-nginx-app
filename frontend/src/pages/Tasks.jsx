import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import { 
  Search, 
  SlidersHorizontal, 
  CheckSquare, 
  Plus, 
  Calendar, 
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ClipboardList
} from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]); // Loaded for options in task creation/editing
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // Query Parameters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('edit'); // edit, create
  const [selectedTask, setSelectedTask] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch Tasks List
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks', {
        params: {
          search,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          sortBy,
          sortOrder,
          page,
          limit: 10
        }
      });

      if (response.data?.status === 'success') {
        setTasks(response.data.data.tasks);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching tasks list:', err);
      setError('Failed to fetch tasks. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects list (for dropdown selector in tasks creation)
  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects', { params: { filter: 'active', limit: 100 } });
      if (response.data?.status === 'success') {
        setProjects(response.data.data.projects);
      }
    } catch (err) {
      console.error('Error loading projects list:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const openCreateModal = () => {
    if (projects.length === 0) {
      return setError('You must create at least one project before adding a task.');
    }
    setModalMode('create');
    setSelectedTask(null);
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setStatus('Todo');
    setDueDate('');
    setProjectId(projects[0].id);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setModalMode('edit');
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    setProjectId(task.project_id);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setFormError('Task title is required.');
    if (!projectId) return setFormError('Project selection is required.');

    setActionLoading(true);
    setFormError('');

    try {
      if (modalMode === 'create') {
        await api.post('/tasks', {
          projectId,
          title,
          description,
          priority,
          status,
          due_date: dueDate || null
        });
      } else {
        await api.put(`/tasks/${selectedTask.id}`, {
          title,
          description,
          priority,
          status,
          due_date: dueDate || null
        });
      }

      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error('Error saving task details:', err);
      setFormError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    setActionLoading(true);
    setFormError('');

    try {
      await api.delete(`/tasks/${selectedTask.id}`);
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setFormError('Failed to delete task.');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to format date
  const formatTaskDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="animate-fade">
      {/* Top action header */}
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Inspect, refine, and prioritize your global task scope
        </p>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Query Filters */}
      <div 
        className="glass-card" 
        style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '28px' }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dark)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search tasks by title/desc..."
            value={search}
            onChange={handleSearchChange}
            style={{ paddingLeft: '38px', paddingRight: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Status filter */}
          <div className="flex-center" style={{ gap: '6px' }}>
            <SlidersHorizontal size={14} style={{ color: 'var(--text-dark)' }} />
            <select 
              className="form-control form-select" 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} 
              style={{ width: '130px', padding: '8px 12px' }}
            >
              <option value="">All Statuses</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority filter */}
          <select 
            className="form-control form-select" 
            value={priorityFilter} 
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} 
            style={{ width: '130px', padding: '8px 12px' }}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          {/* Sort Column */}
          <select 
            className="form-control form-select" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            style={{ width: '140px', padding: '8px 12px' }}
          >
            <option value="created_at">Date Created</option>
            <option value="due_date">Due Date</option>
            <option value="title">Task Title</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>

          {/* Sort Order */}
          <select 
            className="form-control form-select" 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)} 
            style={{ width: '110px', padding: '8px 12px' }}
          >
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>
      </div>

      {/* Tasks Table / Loader */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton skeleton-text" style={{ height: '56px', width: '100%' }} />
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Project</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{task.title}</div>
                      {task.description && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dark)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {task.project_name}
                      </span>
                    </td>
                    <td>
                      <span className={`task-priority-tag priority-${task.priority}`} style={{ margin: 0 }}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 
                          task.status === 'Completed' ? 'var(--success)' :
                          task.status === 'Review' ? 'var(--info)' :
                          task.status === 'In Progress' ? 'var(--warning)' : 'var(--text-muted)'
                      }}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {formatTaskDate(task.due_date)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => openEditModal(task)} 
                        className="btn-icon"
                        style={{ padding: '6px' }}
                      >
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
          <ClipboardList size={48} style={{ color: 'var(--text-dark)', marginBottom: '16px' }} />
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>No tasks found</h3>
          <p style={{ fontSize: '0.9rem' }}>You don't have any tasks matching the criteria. Click "New Task" to create one.</p>
          <button onClick={openCreateModal} className="btn btn-primary" style={{ marginTop: '20px' }}>
            <Plus size={16} /> Add Task
          </button>
        </div>
      )}

      {/* Task Creation / Editing Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create Global Task' : 'Edit Task'}
      >
        {formError && (
          <div className="alert alert-error">
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleTaskSubmit}>
          {modalMode === 'create' && (
            <div className="form-group">
              <label className="form-label" htmlFor="task-proj-select">Assign to Project</label>
              <select
                id="task-proj-select"
                className="form-control form-select"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={actionLoading}
                required
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="task-title-input">Task Title</label>
            <input
              id="task-title-input"
              type="text"
              className="form-control"
              placeholder="e.g. Implement refresh tokens"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              disabled={actionLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc-input">Description</label>
            <textarea
              id="task-desc-input"
              className="form-control"
              placeholder="Detailed guidelines..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={actionLoading}
            />
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="task-priority-select">Priority</label>
              <select
                id="task-priority-select"
                className="form-control form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={actionLoading}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-status-select">Status</label>
              <select
                id="task-status-select"
                className="form-control form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={actionLoading}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label" htmlFor="task-due-input">Due Date</label>
            <input
              id="task-due-input"
              type="date"
              className="form-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={actionLoading}
            />
          </div>

          <div className="flex-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '18px' }}>
            <div>
              {modalMode === 'edit' && (
                <button 
                  type="button" 
                  onClick={handleDeleteTask} 
                  className="btn btn-danger" 
                  disabled={actionLoading}
                >
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" disabled={actionLoading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Saving...' : modalMode === 'create' ? 'Create Task' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
