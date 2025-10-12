import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [filter, setFilter] = useState('all')
  const [expandedTask, setExpandedTask] = useState(null)
  const [toast, setToast] = useState(null)
  const [celebration, setCelebration] = useState(null)
  const [animatingTaskId, setAnimatingTaskId] = useState(null)

  // ローカルストレージからタスクを読み込み
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // タスクが変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  // トースト通知を表示
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // 完了時のお祝いアニメーション
  const showCelebration = (taskId) => {
    setCelebration(taskId)
    setTimeout(() => setCelebration(null), 2000)
  }

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        title: newTask,
        description: newDescription,
        status: 'not-started',
        progress: 0,
        createdAt: new Date().toISOString(),
        priority: 'medium',
        dueDate: '',
        memo: ''
      }
      setTasks([...tasks, task])
      setNewTask('')
      setNewDescription('')
      showToast('✓ タスクを追加しました！')
    }
  }

  const deleteTask = (id) => {
    setAnimatingTaskId(id)
    setTimeout(() => {
      setTasks(tasks.filter(task => task.id !== id))
      if (expandedTask === id) {
        setExpandedTask(null)
      }
      setAnimatingTaskId(null)
    }, 300)
  }

  const updateTaskStatus = (id, status) => {
    const previousTask = tasks.find(task => task.id === id)
    setTasks(tasks.map(task => {
      if (task.id === id) {
        let newProgress = task.progress
        if (status === 'not-started') newProgress = 0
        if (status === 'completed') {
          newProgress = 100
          if (previousTask.status !== 'completed') {
            showCelebration(id)
            showToast('🎉 タスクを完了しました！', 'celebration')
          }
        }
        if (status === 'in-progress' && newProgress === 0) newProgress = 25
        return { ...task, status, progress: newProgress }
      }
      return task
    }))
  }

  const updateTaskProgress = (id, progress) => {
    const previousTask = tasks.find(task => task.id === id)
    setTasks(tasks.map(task => {
      if (task.id === id) {
        let newStatus = task.status
        if (progress === 0) newStatus = 'not-started'
        else if (progress === 100) {
          newStatus = 'completed'
          if (previousTask.status !== 'completed') {
            showCelebration(id)
            showToast('🎉 タスクを完了しました！', 'celebration')
          }
        } else newStatus = 'in-progress'
        return { ...task, progress: parseInt(progress), status: newStatus }
      }
      return task
    }))
  }

  const updateTaskField = (id, field, value) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, [field]: value } : task
    ))
  }

  const getStatusLabel = (status) => {
    const labels = {
      'not-started': '未着手',
      'in-progress': '進行中',
      'completed': '完了'
    }
    return labels[status] || status
  }

  const getStatusIcon = (status) => {
    const icons = {
      'not-started': '○',
      'in-progress': '◐',
      'completed': '●'
    }
    return icons[status] || '○'
  }

  const getStatusColor = (status) => {
    const colors = {
      'not-started': 'var(--status-not-started)',
      'in-progress': 'var(--status-in-progress)',
      'completed': 'var(--status-completed)'
    }
    return colors[status] || 'var(--status-not-started)'
  }

  const getPriorityLabel = (priority) => {
    const labels = {
      'high': '高',
      'medium': '中',
      'low': '低'
    }
    return labels[priority] || '中'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'high': '#FFB4B4',
      'medium': '#FFE4B4',
      'low': '#D4E4FF'
    }
    return colors[priority] || '#FFE4B4'
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    notStarted: tasks.filter(t => t.status === 'not-started').length,
    averageProgress: tasks.length > 0
      ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)
      : 0
  }

  // 応援メッセージ
  const getEncouragementMessage = () => {
    if (stats.averageProgress >= 80) return '素晴らしい！あと少しです'
    if (stats.averageProgress >= 50) return '順調に進んでいます'
    if (stats.averageProgress >= 20) return '良いスタートです'
    return '今日も一歩ずつ'
  }

  return (
    <div className="app">
      {/* トースト通知 */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <header className="header">
        <h1>
          <span className="header-icon">✓</span>
          タスク管理
        </h1>
        <p className="encouragement">{getEncouragementMessage()}</p>
        <div className="stats-bar">
          <div className="stat">
            <div className="stat-icon">□</div>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">総タスク</span>
          </div>
          <div className="stat">
            <div className="stat-icon">○</div>
            <span className="stat-value">{stats.notStarted}</span>
            <span className="stat-label">未着手</span>
          </div>
          <div className="stat">
            <div className="stat-icon">◐</div>
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">進行中</span>
          </div>
          <div className="stat">
            <div className="stat-icon">●</div>
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">完了</span>
          </div>
          <div className="stat stat-highlight">
            <div className="stat-icon">■</div>
            <span className="stat-value">{stats.averageProgress}%</span>
            <span className="stat-label">平均進捗</span>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="add-task-section">
          <h2>+ 新しいタスク</h2>
          <input
            type="text"
            placeholder="タスク名を入力..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && addTask()}
            className="task-input"
          />
          <textarea
            placeholder="作業内容の詳細（オプション）"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="task-textarea"
          />
          <button onClick={addTask} className="add-button">
            追加する
          </button>
        </div>

        <div className="filter-section">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            すべて ({tasks.length})
          </button>
          <button
            className={`filter-button ${filter === 'not-started' ? 'active' : ''}`}
            onClick={() => setFilter('not-started')}
          >
            未着手 ({stats.notStarted})
          </button>
          <button
            className={`filter-button ${filter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilter('in-progress')}
          >
            進行中 ({stats.inProgress})
          </button>
          <button
            className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            完了 ({stats.completed})
          </button>
        </div>

        <div className="tasks-section">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">□</div>
              <p>タスクがありません</p>
              <p className="empty-state-hint">上のフォームから新しいタスクを追加してください</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className={`task-card ${expandedTask === task.id ? 'expanded' : ''} ${
                  animatingTaskId === task.id ? 'deleting' : ''
                } ${celebration === task.id ? 'celebrating' : ''}`}
              >

                <div className="task-header" onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}>
                  <div className="task-title-section">
                    <div className="task-title-wrapper">
                      <span className="task-status-icon">{getStatusIcon(task.status)}</span>
                      <h3>{task.title}</h3>
                    </div>
                    <div className="task-badges">
                      <span
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      >
                        {getPriorityLabel(task.priority)}
                      </span>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(task.status) }}
                      >
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                  </div>
                  <div className="task-progress-display">
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${task.progress}%`,
                          backgroundColor: getStatusColor(task.status)
                        }}
                      />
                    </div>
                    <span className="progress-text">{task.progress}%</span>
                  </div>
                </div>

                {expandedTask === task.id && (
                  <div className="task-details">
                    <div className="task-control-grid">
                      <div className="task-control">
                        <label>ステータス</label>
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="not-started">未着手</option>
                          <option value="in-progress">進行中</option>
                          <option value="completed">完了</option>
                        </select>
                      </div>

                      <div className="task-control">
                        <label>優先度</label>
                        <select
                          value={task.priority}
                          onChange={(e) => updateTaskField(task.id, 'priority', e.target.value)}
                          className="priority-select"
                        >
                          <option value="high">高</option>
                          <option value="medium">中</option>
                          <option value="low">低</option>
                        </select>
                      </div>

                      <div className="task-control">
                        <label>期限</label>
                        <input
                          type="date"
                          value={task.dueDate}
                          onChange={(e) => updateTaskField(task.id, 'dueDate', e.target.value)}
                          className="date-input"
                        />
                      </div>
                    </div>

                    <div className="task-control">
                      <label>進捗率: {task.progress}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={task.progress}
                        onChange={(e) => updateTaskProgress(task.id, e.target.value)}
                        className="progress-slider"
                        style={{
                          background: `linear-gradient(to right, ${getStatusColor(task.status)} 0%, ${getStatusColor(task.status)} ${task.progress}%, #E9E5DF ${task.progress}%, #E9E5DF 100%)`
                        }}
                      />
                    </div>

                    <div className="task-control">
                      <label>作業内容</label>
                      <textarea
                        value={task.description}
                        onChange={(e) => updateTaskField(task.id, 'description', e.target.value)}
                        placeholder="作業内容の詳細を入力..."
                        className="description-textarea"
                      />
                    </div>

                    <div className="task-control">
                      <label>メモ</label>
                      <textarea
                        value={task.memo}
                        onChange={(e) => updateTaskField(task.id, 'memo', e.target.value)}
                        placeholder="メモや補足情報を入力..."
                        className="memo-textarea"
                      />
                    </div>

                    <div className="task-meta">
                      <span>作成日時: {new Date(task.createdAt).toLocaleString('ja-JP')}</span>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="delete-button"
                    >
                      削除する
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default App
