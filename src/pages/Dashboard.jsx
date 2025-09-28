import React, { useCallback, useMemo, useState } from 'react'
import { ADD_BUTTON, EMPTY_STATE, FILTER_LABELS, FILTER_OPTIONS, FILTER_WRAPPER, 
  HEADER, ICON_WRAPPER, LABEL_CLASS, SELECT_CLASSES, STAT_CARD, STATS, STATS_GRID, 
  TAB_ACTIVE, TAB_BASE, TAB_INACTIVE, TABS_WRAPPER, VALUE_CLASS, WRAPPER } from '../assets/dummy'
import { CalendarIcon, Filter, HomeIcon, Plus } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import TaskItem from '../components/TaskItem'
import axios from 'axios'
import TaskModal from '../components/TaskModal'
import { API_BASE } from "../config/api";


const Dashboard = () => {

  const {tasks, refreshTasks} = useOutletContext()
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('all');
  console.log("Todas as tarefas:", tasks);

  const stats = useMemo(() => ({
      total: tasks.length,
      lowPriority : tasks.filter(t => t.priority?.toLowerCase() === "low").length,
      mediumPriority : tasks.filter(t => t.priority?.toLowerCase() ==="medium").length,
      highPriority : tasks.filter(t => t.priority?.toLowerCase() ==="high").length,
      completed : tasks.filter(t => t.completed === true || t.completed === 1 || (
        typeof t.completed === "string" && t.completed.toLowerCase() === "yes"
      )).length
  }),[tasks])

  // filter tasks
  const filteredTasks = useMemo(() => tasks.filter(task => {
    const dueDate = new Date(task.dueDate)
    const today =  new Date()
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7)

    switch(filter){
      case "today" :
        return dueDate.toDateString() === today.toDateString()
      case "week" :
        return dueDate >= today && dueDate <= nextWeek 
      case "high" : 
      case "medium" :
      case "low" :
        return task.priority?.toLowerCase() === filter
        default:
        return true
    }
  }),[tasks, filter])

  //saving Tasks
  const handleTaskSave =  useCallback(async (taskData) => {
    try {
      if(taskData.id) await axios.put(`${API_BASE}/${taskData.id}/gp`, taskData)
      refreshTasks()
      setShowModal(false)
      setSelectedTask(null)
    } catch (error) {
      console.error("Erro ao salvar tarefa", error)
    }
  },[refreshTasks])

  return (
    <div className={WRAPPER}>
      {/* header */}
      <div className={HEADER}>
        <div className='min-w-0'>
          <h1 className='text-xl font-bold md:text-3xl text-gray-800 flex items-center gap-2'>
            <HomeIcon className='h-5 w-5 text-purple-500 md:w-6 md:h-6 shrink-0 ' />
            <span className='truncate'>Visão Geral Das Tarefas</span>
          </h1>
          <p className='text-sm text-gray-500 mt-1 ml-7 truncate'>Gerencie Suas Tarefas Com Eficiência.</p>
        </div>

        <button onClick={() => setShowModal(true)} className={ADD_BUTTON}>
          <Plus size={18} />
          Adicionar Nova Tarefa
        </button>
      </div>

      {/* stats */}
      <div className={STATS_GRID}>
        {STATS.map(({ key, label, icon:Icon, iconColor, borderColor="border-purple-100",
        valueKey, textColor, gradient 
      }) => (
          <div key={key} className={`${STAT_CARD} ${borderColor}`}>
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`${ICON_WRAPPER} ${iconColor} `}>
                <Icon className='h-4 w-4 md:h-5 md:w-5' />
              </div>

              <div className='min-w-0'>
                <p className={`${VALUE_CLASS} ${gradient ? 
                "bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent "
                  : textColor }`}>{stats[valueKey]}</p>
                <p className={LABEL_CLASS}>{label}</p>   
              </div>
            </div>
          </div>
        ))}
    </div>

        {/* contents */}
        <div className='space-y-6'>
          {/* filter */}
          <div className={FILTER_WRAPPER}>
            <div className='flex items-center gap-2 min-w-0'>
                <Filter className='w-5 h-5 text-purple-500 shrink-0 ' />
                <h2 className='text-base md:text-lg truncate font-bold text-gray-800'>
                  {FILTER_LABELS[filter]}
                </h2>
            </div>

            <select value={filter} onChange={(e) => setFilter(e.target.value)} 
              className={SELECT_CLASSES}>
                {FILTER_OPTIONS.map(opt => <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option> )}
              </select>

              <div className={TABS_WRAPPER}>
                  {FILTER_OPTIONS.map(opt => (
                    <button key={opt} onClick={() => setFilter(opt)} className={`${TAB_BASE} ${filter===opt ? 
                      TAB_ACTIVE : TAB_INACTIVE}`}>
                         {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </button>
                  ))}
              </div>
          </div>

          {/* task list */}
          <div className='space-y-4'>
            {filteredTasks.length === 0 ? (
              <div className={EMPTY_STATE.wrapper}>
                <div className={EMPTY_STATE.iconWrapper}>
                  <CalendarIcon className='w-8 h-8 text-purple-500' />
                   </div>
                  <h3 className='text-lg font-semibold text-gray-800 mb-2'>Nenhuma tarefa encontrada</h3>
                  <p className='text-sm text-gray-500 mb-4 '>{filter === "all" ?
                  "Crie sua primeira tarefa para começar" : "Nenhuma tarefa encontrada para este filtro"}</p>
                  <button onClick={() => setShowModal(true)} className={EMPTY_STATE.btn}>
                    Adicionar Nova Tarefa
                  </button>               
              </div>
            ): (
              filteredTasks.map(task => (
                <TaskItem key={task._id || task.id} 
                task={task} 
                onRefresh={refreshTasks}
                showCompleteCheckbox
                onEdit={() => {setSelectedTask(task); setShowModal(true)}}/>
              ))
            )}
          </div>    

          

              {/* add task desktop */}
          <div onClick={() => setShowModal(true)} className='hidden md:flex items-center justify-center p-4 border-2 border-dashed border-purple-200 
          rounded-xl hover:border-purple-400 bg-purple-50/50 cursor-pointer transition-colors'>
            <Plus className='w-5 h-5 text-purple-500 mr-2'/>
            <span className='text-gray-600 font-medium'>Adicionar Nova Tarefa</span>
          </div>   
      </div>

      {/* modal */}
      <TaskModal isOpen = {showModal || !!selectedTask} onClose = {() => {setShowModal(false); setSelectedTask(null)}} 
       taskToEdit= {selectedTask} onSave={handleTaskSave}/>
    </div>
  )
}

export default Dashboard  //3.36 taskItem