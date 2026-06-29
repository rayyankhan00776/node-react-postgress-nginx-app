import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const TaskCard = ({ task, onClick }) => {
  // Format due date for presentation
  const formatDueDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Determine if task is overdue
  const isOverdue = () => {
    if (!task.due_date || task.status === 'Completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due_date);
    return dueDate < today;
  };

  return (
    <div className="task-card" onClick={onClick}>
      <span className={`task-priority-tag priority-${task.priority}`}>
        {task.priority}
      </span>
      
      <h4 className="task-title">{task.title}</h4>
      
      {task.description && (
        <p className="task-desc">{task.description}</p>
      )}

      {task.project_name && (
        <div style={{ fontSize: '0.78rem', color: 'var(--primary)', marginBottom: '8px', fontWeight: 500 }}>
          Project: {task.project_name}
        </div>
      )}

      <div className="task-footer">
        <div className="flex-center" style={{ gap: '4px', color: isOverdue() ? 'var(--danger)' : 'var(--text-dark)' }}>
          <Calendar size={12} />
          <span>{formatDueDate(task.due_date)}</span>
        </div>
        
        {isOverdue() && (
          <span style={{ color: 'var(--danger)', fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Clock size={10} /> Overdue
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
