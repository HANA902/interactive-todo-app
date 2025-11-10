import { useState, useEffect } from 'react'
import { useSwipeable } from 'react-swipeable'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2, Circle,
  Calendar, Target, Check, Tag, BarChart3, TrendingUp, X, GripVertical,
  Eye, EyeOff, Clock, MoreVertical, Archive, HelpCircle, Edit2, Save, XCircle
} from 'lucide-react'
import HowToUse from './HowToUse'

// 曜日定義
const WEEKDAYS = [
  { key: 'monday', label: '月曜日', short: '月' },
  { key: 'tuesday', label: '火曜日', short: '火' },
  { key: 'wednesday', label: '水曜日', short: '水' },
  { key: 'thursday', label: '木曜日', short: '木' },
  { key: 'friday', label: '金曜日', short: '金' }
]

function App() {
  const [tasks, setTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [newTaskDay, setNewTaskDay] = useState('monday')
  const [newTaskTags, setNewTaskTags] = useState('')
  const [view, setView] = useState('kanban') // 'kanban' | 'today'
  const [expandedTaskId, setExpandedTaskId] = useState(null)
  const [showSummary, setShowSummary] = useState(false)
  const [showCompletedTasks, setShowCompletedTasks] = useState(true)
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false)
  const [showArchivedDrawer, setShowArchivedDrawer] = useState(false)
  const [showHowToUse, setShowHowToUse] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // 今日の日付と曜日
  const getTodayStr = () => new Date().toISOString().slice(0, 10)
  const getTodayDayOfWeek = () => {
    const day = new Date().getDay()
    const dayMap = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday' }
    return dayMap[day] || null
  }

  // 曜日から今週のその日の日付を取得
  const getDateForWeekday = (weekdayKey) => {
    const dayIndexMap = { 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5 }
    const targetDayIndex = dayIndexMap[weekdayKey]
    if (!targetDayIndex) return null

    const today = new Date()
    const currentDayIndex = today.getDay()

    // 月曜日を基準にした今週の開始日を計算
    const mondayOffset = currentDayIndex === 0 ? -6 : 1 - currentDayIndex
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)

    // 目標曜日の日付を計算
    const targetDate = new Date(monday)
    targetDate.setDate(monday.getDate() + (targetDayIndex - 1))

    return targetDate.toISOString().slice(0, 10)
  }

  // 進捗計算関数
  const calcProgress = (subtasks = []) =>
    subtasks.length ? Math.round((subtasks.filter(s => s.done).length / subtasks.length) * 100) : 0

  // 完了率の計算
  const completionRate = (taskList) => {
    if (!taskList.length) return 0
    const done = taskList.filter(t => t.status === 'done').length
    return Math.round((done / taskList.length) * 100)
  }

  // 翌営業日を取得
  const getNextWeekday = (currentDay) => {
    const index = WEEKDAYS.findIndex(d => d.key === currentDay)
    if (index === -1 || index === WEEKDAYS.length - 1) return WEEKDAYS[0].key
    return WEEKDAYS[index + 1].key
  }

  // LocalStorageからタスクを読み込み & マイグレーション
  useEffect(() => {
    const savedTasks = localStorage.getItem('nordic-tasks')
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks)
      // データマイグレーション：古い形式を新しい形式に変換
      const migrated = parsed.map(task => ({
        ...task,
        assignedDay: task.assignedDay || 'monday',
        tags: task.tags || [],
        subtasks: task.subtasks || [],
        doneAt: task.doneAt || null,
        archivedAt: task.archivedAt || null
      }))
      setTasks(migrated)
    }
  }, [])

  // タスクをLocalStorageに保存
  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem('nordic-tasks')) {
      localStorage.setItem('nordic-tasks', JSON.stringify(tasks))
    }
  }, [tasks])

  // タスク追加
  const addTask = () => {
    if (newTaskTitle.trim()) {
      const now = new Date().toISOString()
      const tags = newTaskTags.split(',').map(t => t.trim()).filter(t => t)
      const task = {
        id: Date.now(),
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        status: 'todo',
        dueDate: newTaskDueDate || null,
        assignedDay: newTaskDay,
        tags: tags,
        subtasks: [],
        createdAt: now,
        updatedAt: now,
        doneAt: null,
        archivedAt: null
      }
      setTasks([...tasks, task])
      setNewTaskTitle('')
      setNewTaskDescription('')
      setNewTaskDueDate('')
      setNewTaskTags('')
    }
  }

  // タスク編集
  const updateTask = (taskId, updates) => {
    const now = new Date().toISOString()
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, ...updates, updatedAt: now }
        : task
    ))
  }

  // タスク削除
  const deleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId))
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null)
    }
  }

  // タスク完了にする
  const markAsDone = (taskId) => {
    const now = new Date().toISOString()
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status: 'done', doneAt: now, updatedAt: now }
        : task
    ))
  }

  // タスクを翌日に移動
  const moveToNextDay = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const nextDay = getNextWeekday(task.assignedDay)
        return { ...task, assignedDay: nextDay, updatedAt: new Date().toISOString() }
      }
      return task
    }))
  }

  // ドラッグ終了時の処理
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over) return

    const activeTaskId = active.id
    const overColumnDay = over.id

    // タスクを別の曜日に移動
    if (WEEKDAYS.some(d => d.key === overColumnDay)) {
      const newDueDate = getDateForWeekday(overColumnDay)
      setTasks(tasks.map(task =>
        task.id === activeTaskId
          ? { ...task, assignedDay: overColumnDay, dueDate: newDueDate, updatedAt: new Date().toISOString() }
          : task
      ))
    }
  }

  // サブタスク追加
  const addSubtask = (taskId, subtaskTitle) => {
    if (!subtaskTitle.trim()) return

    const now = new Date().toISOString()
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newSubtasks = [...task.subtasks, {
          id: Date.now(),
          title: subtaskTitle.trim(),
          done: false
        }]
        const progress = calcProgress(newSubtasks)
        const newStatus = progress === 100 ? 'done' : progress > 0 ? 'doing' : 'todo'
        return {
          ...task,
          subtasks: newSubtasks,
          status: newStatus,
          doneAt: newStatus === 'done' ? now : null,
          updatedAt: now
        }
      }
      return task
    }))
  }

  // サブタスク削除
  const deleteSubtask = (taskId, subtaskId) => {
    const now = new Date().toISOString()
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newSubtasks = task.subtasks.filter(s => s.id !== subtaskId)
        const progress = calcProgress(newSubtasks)
        const newStatus = progress === 100 ? 'done' : progress > 0 ? 'doing' : 'todo'
        return {
          ...task,
          subtasks: newSubtasks,
          status: newStatus,
          doneAt: newStatus === 'done' ? now : null,
          updatedAt: now
        }
      }
      return task
    }))
  }

  // サブタスクトグル
  const toggleSubtask = (taskId, subtaskId) => {
    const now = new Date().toISOString()
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newSubtasks = task.subtasks.map(s =>
          s.id === subtaskId ? { ...s, done: !s.done } : s
        )
        const progress = calcProgress(newSubtasks)
        const newStatus = progress === 100 ? 'done' : progress > 0 ? 'doing' : 'todo'
        return {
          ...task,
          subtasks: newSubtasks,
          status: newStatus,
          doneAt: newStatus === 'done' ? now : null,
          updatedAt: now
        }
      }
      return task
    }))
  }

  // タスクステータス変更
  const updateTaskStatus = (taskId, status) => {
    const now = new Date().toISOString()
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status, doneAt: status === 'done' ? now : null, updatedAt: now }
        : task
    ))
  }

  // タスクを履歴へ移動（アーカイブ）
  const archiveTask = (taskId) => {
    const now = new Date().toISOString()
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, archivedAt: now, updatedAt: now }
        : task
    ))
  }

  // タスクを復元（アーカイブ解除）
  const restoreTask = (taskId) => {
    const now = new Date().toISOString()
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, archivedAt: null, updatedAt: now }
        : task
    ))
  }

  // タスクを完全削除
  const permanentlyDeleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId))
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null)
    }
  }

  // 週次統計
  const weeklyStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'doing').length,
    completionRate: completionRate(tasks),
    byDay: WEEKDAYS.map(day => ({
      day: day.label,
      count: tasks.filter(t => t.assignedDay === day.key).length,
      done: tasks.filter(t => t.assignedDay === day.key && t.status === 'done').length
    }))
  }

  // 今日のタスク
  const todayDay = getTodayDayOfWeek()
  const todayTasks = tasks.filter(t => !t.archivedAt && t.assignedDay === todayDay && t.status !== 'done')

  // 今週の完了タスク（アーカイブされていないもの）
  const thisWeekCompletedTasks = tasks.filter(t => !t.archivedAt && t.status === 'done' && t.doneAt)

  // アーカイブされたタスク
  const archivedTasks = tasks.filter(t => t.archivedAt)

  return (
    <div className="min-h-screen bg-sand-100">
      {/* ヘッダー */}
      <header className="bg-white border-b border-sand-300 relative">
        {/* 雲キャラクター - 右上に配置 */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
          <img
            src="/cloud-mascot.png"
            alt="予定を詰めすぎると、空が曇っちゃうよ"
            className="w-24 sm:w-32 md:w-40 h-auto drop-shadow-md hover:scale-110 transition-transform duration-300"
          />
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">My Weekly Flow</h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 truncate">週次タスクボード - ドラッグ&ドロップで自由に管理</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 ml-2 mr-20 sm:mr-28 md:mr-36">
              <button
                onClick={() => setShowHowToUse(true)}
                className="btn-secondary flex items-center gap-1 sm:gap-2 p-2 sm:px-3 sm:py-2"
                title="使い方ガイド"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hide-on-mobile">使い方</span>
              </button>
              <button
                onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                className="btn-secondary flex items-center gap-1 sm:gap-2 p-2 sm:px-3 sm:py-2"
                title={showCompletedTasks ? '完了タスク表示' : '完了タスク非表示'}
              >
                {showCompletedTasks ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="hide-on-mobile">完了タスク</span>
              </button>
              <button
                onClick={() => setShowArchivedDrawer(true)}
                className="btn-secondary flex items-center gap-1 sm:gap-2 p-2 sm:px-3 sm:py-2 relative"
                title="履歴"
              >
                <Archive className="w-4 h-4" />
                <span className="hide-on-mobile">履歴</span>
                {archivedTasks.length > 0 && (
                  <span className="absolute -top-1 -right-1 sm:relative sm:top-0 sm:right-0 sm:ml-1 px-1.5 sm:px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs font-bold">
                    {archivedTasks.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowSummary(true)}
                className="btn-secondary hidden sm:flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                週次サマリー
              </button>
            </div>
          </div>

          {/* ビュー切り替えタブ */}
          <div className="flex gap-2 sm:gap-3 overflow-x-auto">
            <button
              onClick={() => setView('kanban')}
              className={`btn-filter flex-shrink-0 ${view === 'kanban' ? 'active' : ''}`}
            >
              <span className="flex items-center gap-1 sm:gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm sm:text-base">カンバン</span>
              </span>
            </button>
            <button
              onClick={() => setView('today')}
              className={`btn-filter flex-shrink-0 ${view === 'today' ? 'active' : ''}`}
            >
              <span className="flex items-center gap-1 sm:gap-2">
                <Target className="w-4 h-4" />
                <span className="text-sm sm:text-base">今日</span>
                {todayTasks.length > 0 && (
                  <span className="ml-1 px-1.5 sm:px-2 py-0.5 bg-leaf-500 text-white rounded-full text-xs font-bold">
                    {todayTasks.length}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* タスク追加フォーム */}
        <section className="card p-4 sm:p-6 mb-4 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-leaf-100 rounded-soft">
              <Plus className="w-5 h-5 text-leaf-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">新しいタスク</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="タスク名"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              className="input-field"
            />
            <select
              value={newTaskDay}
              onChange={(e) => setNewTaskDay(e.target.value)}
              className="input-field"
            >
              {WEEKDAYS.map(day => (
                <option key={day.key} value={day.key}>{day.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="タグ（例: デザイン, 開発, レビュー）"
              value={newTaskTags}
              onChange={(e) => setNewTaskTags(e.target.value)}
              className="input-field"
            />
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="input-field"
            />
          </div>

          <textarea
            placeholder="詳細説明（オプション）"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="textarea-field h-20 mt-4"
          />

          <button onClick={addTask} className="btn-primary mt-4">
            <span className="flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              タスクを追加
            </span>
          </button>
        </section>

        {/* カンバンビュー */}
        {view === 'kanban' && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <KanbanBoard
              tasks={tasks}
              expandedTaskId={expandedTaskId}
              onToggleExpand={setExpandedTaskId}
              onDelete={deleteTask}
              onMarkDone={markAsDone}
              onMoveToNextDay={moveToNextDay}
              onAddSubtask={addSubtask}
              onDeleteSubtask={deleteSubtask}
              onToggleSubtask={toggleSubtask}
              onUpdateStatus={updateTaskStatus}
              onArchive={archiveTask}
              calcProgress={calcProgress}
              todayDay={todayDay}
              showCompletedTasks={showCompletedTasks}
            />
          </DndContext>
        )}

        {/* 今日のタスクビュー */}
        {view === 'today' && (
          <TodayView
            tasks={todayTasks}
            expandedTaskId={expandedTaskId}
            onToggleExpand={setExpandedTaskId}
            onDelete={deleteTask}
            onMarkDone={markAsDone}
            onMoveToNextDay={moveToNextDay}
            onAddSubtask={addSubtask}
            onDeleteSubtask={deleteSubtask}
            onToggleSubtask={toggleSubtask}
            onUpdateStatus={updateTaskStatus}
            calcProgress={calcProgress}
          />
        )}
      </div>

      {/* 週次サマリーモーダル */}
      {showSummary && (
        <WeeklySummaryModal
          stats={weeklyStats}
          onClose={() => setShowSummary(false)}
        />
      )}

      {/* FAB - 今週の完了タスク */}
      {thisWeekCompletedTasks.length > 0 && (
        <button
          onClick={() => setShowHistoryDrawer(true)}
          className="fab"
          title="今週の完了タスク"
        >
          <Clock className="w-5 h-5" />
        </button>
      )}

      {/* 履歴ドロワー */}
      {showHistoryDrawer && (
        <HistoryDrawer
          completedTasks={thisWeekCompletedTasks}
          onClose={() => setShowHistoryDrawer(false)}
          onArchive={archiveTask}
          calcProgress={calcProgress}
        />
      )}

      {/* アーカイブドロワー */}
      {showArchivedDrawer && (
        <ArchivedTasksDrawer
          archivedTasks={archivedTasks}
          onClose={() => setShowArchivedDrawer(false)}
          onRestore={restoreTask}
          onPermanentDelete={permanentlyDeleteTask}
          calcProgress={calcProgress}
        />
      )}

      {/* 使い方ガイド */}
      {showHowToUse && (
        <HowToUse onClose={() => setShowHowToUse(false)} />
      )}
    </div>
  )
}

// カンバンボードコンポーネント
function KanbanBoard({
  tasks, expandedTaskId, onToggleExpand, onDelete, onMarkDone, onMoveToNextDay,
  onAddSubtask, onDeleteSubtask, onToggleSubtask, onUpdateStatus, onArchive, calcProgress, todayDay, showCompletedTasks
}) {
  // アーカイブされていないタスクのみを表示
  const activeTasks = tasks.filter(t => !t.archivedAt)

  return (
    <div className="kanban-scroll pb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 min-w-full md:min-w-0">
        {WEEKDAYS.map(day => (
          <KanbanColumn
            key={day.key}
            day={day}
            tasks={activeTasks.filter(t => t.assignedDay === day.key)}
            isToday={day.key === todayDay}
            expandedTaskId={expandedTaskId}
            onToggleExpand={onToggleExpand}
            onDelete={onDelete}
            onMarkDone={onMarkDone}
            onMoveToNextDay={onMoveToNextDay}
            onAddSubtask={onAddSubtask}
            onDeleteSubtask={onDeleteSubtask}
            onToggleSubtask={onToggleSubtask}
            onUpdateStatus={onUpdateStatus}
            onArchive={onArchive}
            onUpdateTask={updateTask}
            calcProgress={calcProgress}
            showCompletedTasks={showCompletedTasks}
          />
        ))}
      </div>
    </div>
  )
}

// カンバン列コンポーネント
function KanbanColumn({
  day, tasks, isToday, expandedTaskId, onToggleExpand, onDelete, onMarkDone,
  onMoveToNextDay, onAddSubtask, onDeleteSubtask, onToggleSubtask, onUpdateStatus, onArchive, onUpdateTask, calcProgress, showCompletedTasks
}) {
  const incompleteTasks = tasks.filter(t => t.status !== 'done')
  const completedTasks = tasks.filter(t => t.status === 'done')
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  const { setNodeRef } = useSortable({
    id: day.key,
    data: { type: 'column' }
  })

  return (
    <div
      ref={setNodeRef}
      className={`rounded-soft-lg border-2 ${
        isToday ? 'border-leaf-400 bg-leaf-50' : 'border-sand-300 bg-white'
      } p-4 sm:p-6 min-h-[500px] sm:min-h-[700px] transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className={`font-bold text-base sm:text-xl ${isToday ? 'text-leaf-600' : 'text-slate-900'}`}>
            <span className="hidden sm:inline">{day.label}</span>
            <span className="sm:hidden">{day.short}</span>
          </h3>
          {isToday && (
            <span className="text-xs text-leaf-600 font-medium mt-1 inline-block">今日</span>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs sm:text-sm font-medium text-slate-600">
            {incompleteTasks.length} / {tasks.length}
          </div>
          {tasks.length > 0 && (
            <div className="text-xs text-slate-500 mt-0.5">
              {completionRate}%
            </div>
          )}
        </div>
      </div>

      <SortableContext items={incompleteTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {incompleteTasks.map(task => (
            <DraggableKanbanCard
              key={task.id}
              task={task}
              isExpanded={expandedTaskId === task.id}
              onToggleExpand={() => onToggleExpand(expandedTaskId === task.id ? null : task.id)}
              onDelete={onDelete}
              onMarkDone={onMarkDone}
              onMoveToNextDay={onMoveToNextDay}
              onAddSubtask={onAddSubtask}
              onDeleteSubtask={onDeleteSubtask}
              onToggleSubtask={onToggleSubtask}
              onUpdateStatus={onUpdateStatus}
              onArchive={onArchive}
              onUpdateTask={onUpdateTask}
              calcProgress={calcProgress}
            />
          ))}
        </div>
      </SortableContext>

      {showCompletedTasks && completedTasks.length > 0 && (
        <div className="pt-4 mt-4 border-t border-sand-300">
          <p className="text-xs font-medium text-slate-500 mb-3">完了 ({completedTasks.length})</p>
          <div className="space-y-2">
            {completedTasks.map(task => (
              <MiniCompletedCard
                key={task.id}
                task={task}
                onArchive={onArchive}
                calcProgress={calcProgress}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ドラッグ可能カンバンカード
function DraggableKanbanCard({ task, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <KanbanCard task={task} dragHandleProps={{ ...attributes, ...listeners }} {...props} />
    </div>
  )
}

// カンバンカードコンポーネント
function KanbanCard({
  task, isExpanded, onToggleExpand, onDelete, onMarkDone, onMoveToNextDay,
  onAddSubtask, onDeleteSubtask, onToggleSubtask, onUpdateStatus, onArchive, onUpdateTask, calcProgress, dragHandleProps
}) {
  const [swipeState, setSwipeState] = useState(null)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description)
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '')
  const [editTags, setEditTags] = useState(task.tags.join(', '))

  const handlers = useSwipeable({
    onSwipedRight: () => {
      if (task.status !== 'done') {
        setSwipeState('right')
        setTimeout(() => {
          onMarkDone(task.id)
          setSwipeState(null)
        }, 300)
      }
    },
    onSwipedLeft: () => {
      setSwipeState('left')
      setTimeout(() => {
        onMoveToNextDay(task.id)
        setSwipeState(null)
      }, 300)
    },
    trackMouse: false,
    delta: 50
  })

  const progress = calcProgress(task.subtasks)

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle)
      setNewSubtaskTitle('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddSubtask()
    }
  }

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      const tags = editTags.split(',').map(t => t.trim()).filter(t => t)
      onUpdateTask(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        dueDate: editDueDate || null,
        tags: tags
      })
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditTitle(task.title)
    setEditDescription(task.description)
    setEditDueDate(task.dueDate || '')
    setEditTags(task.tags.join(', '))
    setIsEditing(false)
  }

  return (
    <div
      {...handlers}
      className={`card-compact p-4 transition-all duration-300 hover:shadow-soft ${
        swipeState === 'right' ? 'bg-leaf-100' : swipeState === 'left' ? 'bg-blue-100' : ''
      }`}
    >
      {/* 進捗バー - カード上部に常時表示 */}
      {task.subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
            <span>{task.subtasks.filter(s => s.done).length}/{task.subtasks.length} サブタスク完了</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="progress-container">
            <div
              className={progress === 100 ? "progress-bar-complete" : "progress-bar"}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 mb-2" onClick={onToggleExpand}>
        <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing pt-1" onClick={(e) => e.stopPropagation()}>
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0 cursor-pointer">
          <h4 className="text-sm font-semibold text-slate-900 mb-2 leading-tight">{task.title}</h4>

          {/* タグ */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.tags.map((tag, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-sand-200 text-slate-600 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 期日 */}
          {task.dueDate && (
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="icon-btn p-1"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-sand-300 rounded-soft shadow-soft z-10 min-w-[140px]">
              <button
                onClick={() => {
                  setIsEditing(true)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-sand-100 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                編集
              </button>
              <button
                onClick={() => {
                  onArchive(task.id)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-sand-100 flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                履歴へ移動
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 展開エリア */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-sand-300 space-y-3" onClick={(e) => e.stopPropagation()}>
          {/* 編集モード */}
          {isEditing && (
            <div className="bg-sand-50 p-3 rounded-soft space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">タスク名</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="input-field text-sm"
                  placeholder="タスク名"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">説明</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="textarea-field text-sm h-16"
                  placeholder="詳細説明"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">タグ</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="input-field text-sm"
                  placeholder="デザイン, 開発, レビュー"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">期日</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-2 bg-leaf-500 text-white rounded hover:bg-leaf-600 font-medium flex items-center justify-center gap-1"
                >
                  <Save className="w-3 h-3" />
                  保存
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 font-medium flex items-center justify-center gap-1"
                >
                  <XCircle className="w-3 h-3" />
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {!isEditing && task.description && (
            <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>
          )}

          {/* サブタスクリスト */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-2">サブタスク</label>
            {task.subtasks.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {task.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-2 bg-sand-50 p-2 rounded group">
                    <button
                      onClick={() => onToggleSubtask(task.id, subtask.id)}
                      className="flex-shrink-0"
                    >
                      {subtask.done ? (
                        <CheckCircle2 className="w-4 h-4 text-leaf-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                    <span className={`flex-1 text-xs ${subtask.done ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => onDeleteSubtask(task.id, subtask.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* サブタスク追加 */}
            <div className="flex gap-1.5">
              <textarea
                placeholder="サブタスクを追加... (Enter: 追加, Shift+Enter: 改行)"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="subtask-textarea flex-1 text-xs"
                rows={2}
              />
              <button
                onClick={handleAddSubtask}
                className="px-2 py-1.5 bg-leaf-500 hover:bg-leaf-600 text-white rounded transition-colors self-start"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onMarkDone(task.id)}
              className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5 bg-leaf-100 text-leaf-600 rounded hover:bg-leaf-200 font-medium min-h-[44px] sm:min-h-0"
            >
              完了
            </button>
            <button
              onClick={() => onMoveToNextDay(task.id)}
              className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 font-medium min-h-[44px] sm:min-h-0"
            >
              翌日へ
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 font-medium min-h-[44px] sm:min-h-0"
            >
              削除
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// 今日のタスクビュー
function TodayView({
  tasks, expandedTaskId, onToggleExpand, onDelete, onMarkDone, onMoveToNextDay,
  onAddSubtask, onDeleteSubtask, onToggleSubtask, onUpdateStatus, calcProgress
}) {
  if (tasks.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-sand-200 rounded-full mb-6">
          <Target className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">今日のタスクはありません</h3>
        <p className="text-slate-600">素晴らしい！または、カンバンボードからタスクを追加してください。</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">今日の集中領域</h2>
        <p className="text-slate-600 mb-6">{tasks.length}個のタスクがあなたを待っています</p>

        <div className="space-y-4">
          {tasks.map(task => (
            <TaskListCard
              key={task.id}
              task={task}
              isExpanded={expandedTaskId === task.id}
              onToggleExpand={() => onToggleExpand(expandedTaskId === task.id ? null : task.id)}
              onDelete={onDelete}
              onMarkDone={onMarkDone}
              onMoveToNextDay={onMoveToNextDay}
              onAddSubtask={onAddSubtask}
              onDeleteSubtask={onDeleteSubtask}
              onToggleSubtask={onToggleSubtask}
              onUpdateStatus={onUpdateStatus}
              calcProgress={calcProgress}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// タスクリストカード
function TaskListCard({
  task, isExpanded, onToggleExpand, onDelete, onMarkDone, onMoveToNextDay,
  onAddSubtask, onDeleteSubtask, onToggleSubtask, onUpdateStatus, calcProgress
}) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [swipeState, setSwipeState] = useState(null)

  const handlers = useSwipeable({
    onSwipedRight: () => {
      setSwipeState('right')
      setTimeout(() => {
        onMarkDone(task.id)
        setSwipeState(null)
      }, 300)
    },
    onSwipedLeft: () => {
      setSwipeState('left')
      setTimeout(() => {
        onMoveToNextDay(task.id)
        setSwipeState(null)
      }, 300)
    },
    trackMouse: false,
    delta: 50
  })

  const progress = calcProgress(task.subtasks)

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle)
      setNewSubtaskTitle('')
    }
  }

  return (
    <div
      {...handlers}
      className={`card overflow-hidden transition-all duration-300 ${
        swipeState === 'right' ? 'bg-leaf-50' : swipeState === 'left' ? 'bg-blue-50' : ''
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 text-lg mb-3">{task.title}</h3>

            {task.description && (
              <p className="text-sm text-slate-600 mb-3 leading-relaxed">{task.description}</p>
            )}

            {/* タグ */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {task.tags.map((tag, i) => (
                  <span key={i} className="badge bg-sand-200 text-slate-600">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 進捗 */}
            {task.subtasks.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                  <span className="font-medium">{task.subtasks.filter(s => s.done).length}/{task.subtasks.length} 完了</span>
                  <span className="font-bold text-leaf-600">{progress}%</span>
                </div>
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>

          <button onClick={onToggleExpand} className="icon-btn">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* クイックアクション */}
        <div className="flex gap-2">
          <button
            onClick={() => onMarkDone(task.id)}
            className="btn-primary px-4 py-2 text-sm"
          >
            <Check className="w-4 h-4 mr-1" />
            完了
          </button>
          <button
            onClick={() => onMoveToNextDay(task.id)}
            className="btn-secondary px-4 py-2 text-sm"
          >
            翌日へ
          </button>
        </div>
      </div>

      {/* 展開エリア */}
      {isExpanded && (
        <div className="border-t border-sand-300 bg-sand-50 p-6">
          <div className="space-y-4">
            {/* サブタスク */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">サブタスク</label>
              {task.subtasks.length > 0 && (
                <div className="space-y-2 mb-3">
                  {task.subtasks.map(subtask => (
                    <div key={subtask.id} className="card-compact p-3 group">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleSubtask(task.id, subtask.id)}
                          className="flex-shrink-0"
                        >
                          {subtask.done ? (
                            <CheckCircle2 className="w-5 h-5 text-leaf-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                        <span className={`flex-1 text-sm ${subtask.done ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {subtask.title}
                        </span>
                        <button
                          onClick={() => onDeleteSubtask(task.id, subtask.id)}
                          className="opacity-0 group-hover:opacity-100 icon-btn p-1"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="サブタスクを追加..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                  className="input-field text-sm py-2"
                />
                <button onClick={handleAddSubtask} className="btn-primary px-3 py-2">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 削除 */}
            <button
              onClick={() => onDelete(task.id)}
              className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-soft transition-colors"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              タスクを削除
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// 週次サマリーモーダル
function WeeklySummaryModal({ stats, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="card max-w-2xl w-full p-4 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">週次サマリー</h2>
            <p className="text-sm sm:text-base text-slate-600">今週のパフォーマンス</p>
          </div>
          <button onClick={onClose} className="icon-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 総合統計 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="stat-card">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-leaf-500" />
            <div className="text-3xl font-bold text-leaf-600 mb-1">{stats.completionRate}%</div>
            <div className="text-xs text-slate-600 font-medium">完了率</div>
          </div>
          <div className="stat-card">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-slate-900" />
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stats.completed}/{stats.total}
            </div>
            <div className="text-xs text-slate-600 font-medium">完了タスク</div>
          </div>
        </div>

        {/* 曜日別統計 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">曜日別進捗</h3>
          {stats.byDay.map(day => (
            <div key={day.day} className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600 w-16">{day.day}</span>
              <div className="flex-1">
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${day.count ? (day.done / day.count) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-slate-600 w-16 text-right">
                {day.done}/{day.count}
              </span>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="btn-primary w-full mt-6">
          閉じる
        </button>
      </div>
    </div>
  )
}

// ミニ完了カード
function MiniCompletedCard({ task, onArchive, calcProgress }) {
  const [showMenu, setShowMenu] = useState(false)
  const progress = calcProgress(task.subtasks)

  return (
    <div className="mini-card flex items-center justify-between gap-2 group">
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-leaf-500 flex-shrink-0" />
        <span className="text-sm text-slate-600 line-through truncate">{task.title}</span>
        {task.subtasks.length > 0 && (
          <span className="text-xs text-slate-500 flex-shrink-0">{progress}%</span>
        )}
      </div>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="opacity-0 group-hover:opacity-100 icon-btn p-1 transition-opacity"
        >
          <MoreVertical className="w-3 h-3" />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-sand-300 rounded-soft shadow-soft z-10 min-w-[140px]">
            <button
              onClick={() => {
                onArchive(task.id)
                setShowMenu(false)
              }}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-sand-100 flex items-center gap-2"
            >
              <Archive className="w-3 h-3" />
              履歴へ移動
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// 履歴ドロワー
function HistoryDrawer({ completedTasks, onClose, onArchive, calcProgress }) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="sticky top-0 bg-white border-b border-sand-300 p-4 sm:p-6 z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">今週の完了タスク</h2>
            <button onClick={onClose} className="icon-btn p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            {completedTasks.length}件のタスクを完了しました
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {completedTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">完了したタスクはまだありません</p>
            </div>
          ) : (
            completedTasks.map(task => {
              const progress = calcProgress(task.subtasks)
              const completedDate = task.doneAt ? new Date(task.doneAt).toLocaleDateString('ja-JP', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : '日時不明'

              return (
                <div key={task.id} className="card-compact p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-leaf-500 flex-shrink-0" />
                        <h3 className="text-sm font-semibold text-slate-900 line-through">{task.title}</h3>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                        <Clock className="w-3 h-3" />
                        {completedDate}
                      </div>
                    </div>
                    <button
                      onClick={() => onArchive(task.id)}
                      className="btn-secondary text-xs px-2 py-1 flex items-center gap-1"
                    >
                      <Archive className="w-3 h-3" />
                      履歴へ
                    </button>
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {task.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-sand-200 text-slate-600 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {task.subtasks.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span>{task.subtasks.filter(s => s.done).length}/{task.subtasks.length} サブタスク完了</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <div className="progress-container">
                        <div className="progress-bar-complete" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

// アーカイブドロワー
function ArchivedTasksDrawer({ archivedTasks, onClose, onRestore, onPermanentDelete, calcProgress }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // アーカイブ日時順でソート（新しい順）
  const sortedTasks = [...archivedTasks].sort((a, b) => {
    const dateA = a.archivedAt ? new Date(a.archivedAt).getTime() : 0
    const dateB = b.archivedAt ? new Date(b.archivedAt).getTime() : 0
    return dateB - dateA
  })

  const handlePermanentDelete = (taskId) => {
    if (confirmDeleteId === taskId) {
      onPermanentDelete(taskId)
      setConfirmDeleteId(null)
    } else {
      setConfirmDeleteId(taskId)
      setTimeout(() => setConfirmDeleteId(null), 3000)
    }
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="sticky top-0 bg-white border-b border-sand-300 p-4 sm:p-6 z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">履歴</h2>
            <button onClick={onClose} className="icon-btn p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            {archivedTasks.length}件のタスクを保管中
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {archivedTasks.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">履歴に移動したタスクはまだありません</p>
            </div>
          ) : (
            sortedTasks.map(task => {
              const progress = calcProgress(task.subtasks)
              const archivedDate = task.archivedAt ? new Date(task.archivedAt).toLocaleDateString('ja-JP', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : '日時不明'

              const dayLabel = WEEKDAYS.find(d => d.key === task.assignedDay)?.label || task.assignedDay

              return (
                <div key={task.id} className="card-compact p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Archive className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <h3 className="text-sm font-semibold text-slate-700">{task.title}</h3>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {archivedDate}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span>{dayLabel}</span>
                        {task.status === 'done' && (
                          <>
                            <span className="text-slate-400">•</span>
                            <span className="text-leaf-600 font-medium">完了済</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-600 mb-2 line-clamp-2">{task.description}</p>
                  )}

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {task.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-sand-200 text-slate-600 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {task.subtasks.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span>{task.subtasks.filter(s => s.done).length}/{task.subtasks.length} サブタスク完了</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <div className="progress-container">
                        <div className={progress === 100 ? "progress-bar-complete" : "progress-bar"} style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-sand-200">
                    <button
                      onClick={() => {
                        onRestore(task.id)
                      }}
                      className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-2 bg-leaf-100 text-leaf-600 rounded hover:bg-leaf-200 font-medium flex items-center justify-center gap-1 min-h-[44px] sm:min-h-0"
                    >
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      復元
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(task.id)}
                      className={`flex-1 text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-2 rounded font-medium flex items-center justify-center gap-1 transition-colors min-h-[44px] sm:min-h-0 ${
                        confirmDeleteId === task.id
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{confirmDeleteId === task.id ? '本当に削除？' : '完全削除'}</span>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

export default App
