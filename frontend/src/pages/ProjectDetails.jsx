import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  FolderOpen,
  Calendar,
  AlertCircle,
  Trash2,
  CheckCircle,
  FileText
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Sorting Board Tasks
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Task Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit
  const [selectedTask, setSelectedTask] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');
  const [dueDate, setDueDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch Project Details & Tasks
  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/tasks', { 
          params: { 
            projectId: id,
            limit: 100 // Fetch all tasks for the board
          } 
        })
      ]);

      if (projRes.data?.status === 'success') {
        setProject(projRes.data.data.project);
      }
      if (tasksRes.data?.status === 'success') {
        setTasks(tasksRes.data.data.tasks);
      }
      setError('');
    } catch (err) {
      console.error('Error loading project workspace:', err);
      if (err.response?.status === 404) {
        navigate('/404');
      } else {
        setError('Failed to load project details. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [id]);

  // Open task creator pre-filled with column status
  const openCreateModal = (initialStatus = 'Todo') => {
    setModalMode('create');
    setSelectedTask(null);
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setStatus(initialStatus);
    setDueDate('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open task editor with details
  const openEditModal = (task) => {
    setModalMode('edit');
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Submit Handler for Task
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setFormError('Task title is required.');

    setActionLoading(true);
    setFormError('');

    try {
      if (modalMode === 'create') {
        await api.post('/tasks', {
          projectId: id,
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
      
      // Refresh tasks
      const tasksRes = await api.get('/tasks', { params: { projectId: id, limit: 100 } });
      if (tasksRes.data?.status === 'success') {
        setTasks(tasksRes.data.data.tasks);
      }
    } catch (err) {
      console.error('Error saving task:', err);
      setFormError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    setActionLoading(true);
    setFormError('');

    try {
      await api.delete(`/tasks/${selectedTask.id}`);
      setIsModalOpen(false);
      
      // Refresh tasks list
      const tasksRes = await api.get('/tasks', { params: { projectId: id, limit: 100 } });
      if (tasksRes.data?.status === 'success') {
        setTasks(tasksRes.data.data.tasks);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setFormError('Failed to delete task.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter and Sort local tasks for display
  const getProcessedTasks = () => {
    let list = [...tasks];

    // Search matches
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q)
      );
    }

    // Priority filter matches
    if (priorityFilter) {
      list = list.filter(t => t.priority === priorityFilter);
    }

    // Apply sorting
    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'created_at') {
        comparison = new Date(a.created_at) - new Date(b.created_at);
      } else if (sortBy === 'due_date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        comparison = new Date(a.due_date) - new Date(b.due_date);
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'priority') {
        const weight = { Low: 1, Medium: 2, High: 3, Critical: 4 };
        comparison = weight[a.priority] - weight[b.priority];
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  };

  if (loading) {
    return (
      <div className="animate-fade">
        <div className="skeleton skeleton-title" />
        <div className="kanban-board">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-card" style={{ height: '400px' }} />
          ))}
        </div>
      </div>
    );
  }

  const processedTasks = getProcessedTasks();
  const columns = ['Todo', 'In Progress', 'Review', 'Completed'];

  return (
    <div className="animate-fade">
      {/* Back to project list */}
      <div style={{ marginBottom: '16px' }}>
        <Link to="/projects" className="flex-center" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', width: 'fit-content' }}>
          <ArrowLeft size={16} />
          <span>Back to Projects</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Project details card header */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px', borderLeft: '4px solid var(--primary)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
          {project?.name}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {project?.description || 'No description provided.'}
        </p>
      </div>

      {/* Board controls and filters */}
      <div 
        className="glass-card" 
        style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '24px' }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dark)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search board tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px', paddingRight: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="flex-center" style={{ gap: '6px' }}>
            <SlidersHorizontal size={14} style={{ color: 'var(--text-dark)' }} />
            <select 
              className="form-control form-select" 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)} 
              style={{ width: '130px', padding: '8px 12px' }}
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <select 
            className="form-control form-select" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            style={{ width: '140px', padding: '8px 12px' }}
          >
            <option value="created_at">Date Created</option>
            <option value="due_date">Due Date</option>
            <option value="title">Task Title</option>
            <option value="priority">Priority Weight</option>
          </select>

          <select 
            className="form-control form-select" 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)} 
            style={{ width: '110px', padding: '8px 12px' }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="kanban-board">
        {columns.map((colName) => {
          const colTasks = processedTasks.filter((t) => t.status === colName);
          return (
            <div key={colName} className="kanban-column">
              <div className="column-header">
                <span className="column-title">
                  {colName === 'Todo' && <FileText size={16} style={{ color: 'var(--text-muted)' }} />}
                  {colName === 'In Progress' && <AlertCircle size={16} style={{ color: 'var(--warning)' }} />}
                  {colName === 'Review' && <SlidersHorizontal size={16} style={{ color: 'var(--info)' }} />}
                  {colName === 'Completed' && <CheckCircle size={16} style={{ color: 'var(--success)' }} />}
                  {colName}
                </span>
                <span className="column-count">{colTasks.length}</span>
              </div>

              <div className="task-list">
                {colTasks.length > 0 ? (
                  colTasks.map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onClick={() => openEditModal(task)} 
                    />
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 10px', fontSize: '0.8rem', color: 'var(--text-dark)', border: '1px dashed rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    No tasks in {colName}
                  </div>
                )}
                
                <button 
                  onClick={() => openCreateModal(colName)} 
                  className="btn btn-secondary" 
                  style={{ width: '100%', fontSize: '0.82rem', padding: '6px', borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)' }}
                  disabled={project?.is_archived}
                >
                  <Plus size={14} /> Add Task
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation / Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create New Task' : 'Edit Task'}
      >
        {formError && (
          <div className="alert alert-error">
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleTaskSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">Task Title</label>
            <input
              id="task-title"
              type="text"
              className="form-control"
              placeholder="e.g. Design Dashboard UI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              disabled={actionLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              className="form-control"
              placeholder="Task details and deliverables..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={actionLoading}
            />
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
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
              <label className="form-label" htmlFor="task-status">Status</label>
              <select
                id="task-status"
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
            <label className="form-label" htmlFor="task-due">Due Date</label>
            <div style={{ position: 'relative' }}>
              <input
                id="task-due"
                type="date"
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={actionLoading}
                style={{ paddingRight: '12px' }}
              />
            </div>
          </div>

          <div className="flex-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '18px' }}>
            <div>
              {modalMode === 'edit' && (
                <button 
                  type="button" 
                  onClick={handleDeleteTask} 
                  className="btn btn-danger" 
                  style={{ padding: '8px 14px' }}
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

export default ProjectDetails;
