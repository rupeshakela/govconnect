import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { CheckSquare, Square, Plus, CheckCircle2, Calendar, ExternalLink, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

const ActionPlanPage = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Document Preparation',
    priority: 'High',
    deadline: 'Next 7 Days',
    officialUrl: ''
  });

  const fetchActionPlan = async () => {
    try {
      setLoading(true);
      const res = await API.get('/benefits/action-plan');
      if (res.data.success) {
        setTasks(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load action plan', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActionPlan();
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      setTasks(prev => prev.map(tItem => tItem._id === taskId ? { ...tItem, isCompleted: !tItem.isCompleted } : tItem));
      await API.put(`/benefits/action-plan/task/${taskId}`);
    } catch (err) {
      console.error('Failed to toggle task', err);
      fetchActionPlan();
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post('/benefits/action-plan/task', newTask);
      setShowAddModal(false);
      setNewTask({
        title: '',
        description: '',
        category: 'Document Preparation',
        priority: 'High',
        deadline: 'Next 7 Days',
        officialUrl: ''
      });
      await fetchActionPlan();
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  const completedCount = tasks.filter(tItem => tItem.isCompleted).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar user={user} onLogout={logout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
        <Navbar user={user} />

        <main style={{ padding: '28px', flex: 1, maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          {/* Hero Banner */}
          <div className="glass-panel" style={{
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '28px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
            border: '1px solid var(--border-glow)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <CheckCircle2 size={18} color="var(--success)" />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    {t('navActionPlan')}
                  </span>
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                  {t('actionPlanTitle')}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '750px', lineHeight: '1.5' }}>
                  {t('actionPlanDesc')}
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}
              >
                <Plus size={16} /> {t('addCustomTask')}
              </button>
            </div>
          </div>

          {/* Progress Tracker Card */}
          <div className="glass-panel" style={{ borderRadius: '14px', padding: '20px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0 }}>
                  {t('actionProgressTitle')}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {completedCount} / {tasks.length} {t('tasksCompleted')}
                </span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--success)' }}>
                {progressPercent}%
              </span>
            </div>

            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #6366f1 100%)', borderRadius: '4px', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          {/* Task List */}
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', marginBottom: '18px' }}>
              {t('stepMilestones')}
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>{t('loadingTasks')}</div>
            ) : tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>{t('noTasks')}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tasks.map((task, index) => {
                  const isHigh = task.priority === 'High';
                  return (
                    <div
                      key={task._id || index}
                      onClick={() => handleToggleTask(task._id)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        background: task.isCompleted ? 'rgba(255, 255, 255, 0.02)' : 'rgba(15, 23, 42, 0.6)',
                        border: task.isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: task.isCompleted ? 0.7 : 1
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        <div style={{ marginTop: '2px', color: task.isCompleted ? 'var(--success)' : 'var(--text-muted)' }}>
                          {task.isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>{t('step')} {index + 1}</span>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: isHigh ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)', color: isHigh ? 'var(--error)' : 'var(--accent-primary)', fontWeight: '700' }}>
                              {t(task.priority)} {t('taskPriority')}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              • {t(task.category)}
                            </span>
                          </div>

                          <h4 style={{
                            fontSize: '15px',
                            fontWeight: '700',
                            color: '#fff',
                            margin: '4px 0',
                            textDecoration: task.isCompleted ? 'line-through' : 'none'
                          }}>
                            {task.title}
                          </h4>
                          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                            {task.description}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                        <span style={{ fontSize: '12px', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> {task.deadline}
                        </span>

                        {task.officialUrl && (
                          <a
                            href={task.officialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary"
                            style={{ fontSize: '11.5px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            {t('portalLink')} <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', borderRadius: '16px', padding: '28px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glow)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>
              {t('addCustomTask')}
            </h3>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>{t('taskTitleLabel')}</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="E.g., Renew Caste Certificate at CSC Center"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>{t('taskDescLabel')}</label>
                <textarea
                  rows="3"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Details of required documents and steps..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>{t('priorityLabel')}</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px' }}
                  >
                    <option value="High">{t('High')}</option>
                    <option value="Medium">{t('Medium')}</option>
                    <option value="Low">{t('Low')}</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>{t('deadlineLabel')}</label>
                  <input
                    type="text"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    placeholder="E.g., Next 5 Days"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>{t('portalLink')} (Optional)</label>
                <input
                  type="text"
                  value={newTask.officialUrl}
                  onChange={(e) => setNewTask({ ...newTask, officialUrl: e.target.value })}
                  placeholder="https://services.india.gov.in"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  {t('saveTask')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPlanPage;
