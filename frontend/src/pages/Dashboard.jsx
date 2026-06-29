import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  FolderOpen,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch stats and recent projects concurrently
        const [statsRes, projectsRes] = await Promise.all([
          api.get('/projects/stats'),
          api.get('/projects?limit=3&sortBy=updated_at&sortOrder=desc')
        ]);

        if (statsRes.data?.status === 'success') {
          setStats(statsRes.data.data.stats);
        }
        if (projectsRes.data?.status === 'success') {
          setRecentProjects(projectsRes.data.data.projects);
        }
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        setError('Failed to fetch dashboard metrics. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="animate-fade">
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
        <div className="grid-cols-2">
          <div className="skeleton skeleton-card" style={{ height: '300px' }} />
          <div className="skeleton skeleton-card" style={{ height: '300px' }} />
        </div>
      </div>
    );
  }

  const completionPercentage = stats?.tasks?.total
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
    : 0;

  const statItems = [
    {
      title: 'Total Projects',
      value: stats?.projects?.total || 0,
      sub: `${stats?.projects?.active || 0} Active`,
      icon: <FolderKanban size={24} />,
      bg: 'rgba(99, 102, 241, 0.1)',
      color: 'var(--primary)'
    },
    {
      title: 'Total Tasks',
      value: stats?.tasks?.total || 0,
      sub: `${stats?.tasks?.pending || 0} Pending`,
      icon: <CheckSquare size={24} />,
      bg: 'rgba(14, 165, 233, 0.1)',
      color: 'var(--info)'
    },
    {
      title: 'Completed Tasks',
      value: stats?.tasks?.completed || 0,
      sub: `${completionPercentage}% Completion rate`,
      icon: <TrendingUp size={24} />,
      bg: 'rgba(16, 185, 129, 0.1)',
      color: 'var(--success)'
    },
    {
      title: 'Pending Work',
      value: stats?.tasks?.pending || 0,
      sub: `${stats?.tasks?.statusBreakdown?.inProgress || 0} In Progress`,
      icon: <Clock size={24} />,
      bg: 'rgba(245, 158, 11, 0.1)',
      color: 'var(--warning)'
    }
  ];

  return (
    <div className="animate-fade">
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="stats-grid">
        {statItems.map((item, idx) => (
          <div key={idx} className="stat-card glass-card">
            <div className="stat-info">
              <h3>{item.title}</h3>
              <p>{item.value}</p>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.sub}</span>
            </div>
            <div className="stat-icon" style={{ backgroundColor: item.bg, color: item.color }}>
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-cols-2" style={{ marginBottom: '32px' }}>
        {/* Task Progress & Breakdown */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px' }}>Task Progress</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '28px' }}>
            {/* Completion circle */}
            <div style={{
              position: 'relative',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: `conic-gradient(var(--success) ${completionPercentage * 3.6}deg, rgba(255, 255, 255, 0.05) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{completionPercentage}%</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Done</span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Your team has completed <strong>{stats?.tasks?.completed}</strong> out of <strong>{stats?.tasks?.total}</strong> total tasks on active projects.
              </p>
            </div>
          </div>

          {/* Status breakdown bar */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Status Breakdown</h3>
            <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' }}>
              {stats?.tasks?.total > 0 ? (
                <>
                  <div style={{ width: `${(stats.tasks.statusBreakdown.todo / stats.tasks.total) * 100}%`, backgroundColor: 'var(--text-dark)' }} title="Todo" />
                  <div style={{ width: `${(stats.tasks.statusBreakdown.inProgress / stats.tasks.total) * 100}%`, backgroundColor: 'var(--warning)' }} title="In Progress" />
                  <div style={{ width: `${(stats.tasks.statusBreakdown.review / stats.tasks.total) * 100}%`, backgroundColor: 'var(--info)' }} title="Review" />
                  <div style={{ width: `${(stats.tasks.statusBreakdown.completed / stats.tasks.total) * 100}%`, backgroundColor: 'var(--success)' }} title="Completed" />
                </>
              ) : (
                <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
              )}
            </div>
            
            {/* Status Legends */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.8rem' }}>
              <span className="flex-center" style={{ gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-dark)' }} />
                <span>Todo ({stats?.tasks?.statusBreakdown?.todo || 0})</span>
              </span>
              <span className="flex-center" style={{ gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }} />
                <span>In Progress ({stats?.tasks?.statusBreakdown?.inProgress || 0})</span>
              </span>
              <span className="flex-center" style={{ gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--info)' }} />
                <span>Review ({stats?.tasks?.statusBreakdown?.review || 0})</span>
              </span>
              <span className="flex-center" style={{ gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                <span>Completed ({stats?.tasks?.statusBreakdown?.completed || 0})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px' }}>Task Priority Distribution</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(stats?.tasks?.priorityBreakdown || {}).map(([priority, count]) => {
              const total = stats?.tasks?.total || 1;
              const percentage = Math.round((count / total) * 100);
              let color = 'var(--primary)';
              if (priority === 'Low') color = 'var(--success)';
              if (priority === 'Medium') color = 'var(--warning)';
              if (priority === 'High') color = 'var(--danger)';
              if (priority === 'Critical') color = '#ff3333';

              return (
                <div key={priority}>
                  <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{priority}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({percentage}%)</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: color, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recently Active Projects</h2>
          <button onClick={() => navigate('/projects')} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            View All Projects
            <ArrowRight size={14} />
          </button>
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid-cols-3">
            {recentProjects.map((project) => (
              <div 
                key={project.id} 
                className="glass-card" 
                style={{ padding: '20px', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.02)' }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="flex-center" style={{ gap: '8px', color: 'var(--primary)', marginBottom: '10px' }}>
                  <FolderOpen size={18} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{project.name}</h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', height: '36px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {project.description || 'No description provided.'}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dark)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                  Last updated: {new Date(project.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <FolderOpen size={40} style={{ color: 'var(--text-dark)', marginBottom: '12px' }} />
            <p>No active projects found. Create a project to get started!</p>
            <button onClick={() => navigate('/projects')} className="btn btn-primary" style={{ marginTop: '16px', fontSize: '0.85rem' }}>
              Create First Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
