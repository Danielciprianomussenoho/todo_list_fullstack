import React, { useCallback, useEffect, useState } from 'react'
import { baseControlClasses, DEFAULT_TASK, priorityStyles } from '../assets/dummy'
import { AlignLeft, Calendar, CheckCircle, Flag, PlusCircle, Save, X } from 'lucide-react';

const API_BASE = "https://todolistapi-4f.up.railway.app/api/tasks"

const TaskModal = ({isOpen, onClose, taskToEdit, onSave, onLogout}) => {
    const [taskData, setTaskData] = useState(DEFAULT_TASK);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const today = new Date().toISOString().split("T")[0]

    useEffect(()=>{
        if(!isOpen) return;
        if(taskToEdit){
            const normalized = taskToEdit.completed === "Yes" || taskToEdit.completed === true ? "Yes" : "No";
            setTaskData({
                ...DEFAULT_TASK,
                title: taskToEdit.title || "",
                description : taskToEdit.description || "",
                priority : taskToEdit.priority || "Low",
                dueDate: taskToEdit.dueDate?.split("T")[0] || "",
                completed : normalized,
                id: taskToEdit._id,
            });
        }else{
            setTaskData(DEFAULT_TASK);
        }
        setError(null)
    },[isOpen,taskToEdit])

    const handleChange = useCallback((e) => {
        const {name, value } = e.target;
        setTaskData(prev => ({...prev, [name] : value }))
    },[])

    const getHeaders = useCallback(() => {
        const token = localStorage.getItem("token")
        if(!token) throw new Error("nenhum token encontrado!")
            return{
                "Content-Type" : "Application/json",
                Authorization : `Bearer ${token}`,
            }
    },[])

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if(taskData.dueDate < today){
            setError("A Data limite não pode estar no passado.")
            return;
        }
        setLoading(true)
        setError(null)

        try {
            const isEdit = Boolean(taskData.id);
            const url = isEdit ? `${API_BASE}/${taskData.id}/gp`: `${API_BASE}/gp`;
            const response = await fetch(url, {
                method : isEdit ? "PUT": "POST",
                headers : getHeaders(),
                body : JSON.stringify(taskData),
            })
            if(!response.ok){
                if(response.status === 401) return onLogout?.();
                const err = await response.json();
                throw new Error(err.message || "Falha ao salvar tarefa")
            }
            const saved = await response.json();
            onSave?.(saved);
            onClose()
        } catch (err) {
            console.error(err);
            setError(err.message || "Aconteceu um erro inesperado!");
        }finally{
            setLoading(false);
        }
    },[taskData, today, getHeaders, onLogout, onSave, onClose])
    
    if(!isOpen) return null;
  return (
    <div className='fixed inset-0 backdrop-blur-sm bg-black/20 z-50 flex items-center justify-center p-4'>
        <div className="bg-white border border-purple-100 rounded-xl  shadow-lg max-w-md w-full relative p-6 animate-fadeIn">
            <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
                    {taskData.id ? 
                    <Save className='text-purple-500 w-5 h-5' /> :
                    <PlusCircle className='text-purple-500 w-5 h-5' />}
                    {taskData.id ? "Editar Tarefa" : "Criar Nova Tarefa"}
                </h2>

                <button onClick={onClose} className='p-2 hover:bg-purple-100 rounded-lg transition-colors text-gray-500 hover:text-purple-700'>
                    <X  className='w-5 h-5'/>
                </button>
            </div>

            {/* form to fill to create the task */}
            <form onSubmit={handleSubmit} className='space-y-4'>
                {error && 
                <div className='text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100'>
                    {error}
                </div>}

                <div className=''>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Titulo da Tarefa
                    </label>

                    <div className='flex items-center border border-purple-100 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all duration-200'>
                        <input type="text" name='title' required value={taskData.title} 
                        onChange={handleChange} className='w-full focus:outline-none text-sm' placeholder='Digite o titulo da tarefa aqui...'/>
                    </div>
                </div>

                <div className=''>
                    <label className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-1'>
                       <AlignLeft className='w-4 h-4 text-purple-500'/>  Descrição
                    </label>

                    <textarea name="description" rows="3" onChange={handleChange} value={taskData.description}
                    className={baseControlClasses} placeholder='Detalhes da sua tarefa...'/>
                </div>

                
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-1'>
                        <Flag className='w-4 h-4 text-purple-500'/>  Prioridade
                        </label>
                        <select name="priority" value={taskData.priority} onChange={handleChange}
                        className={`${baseControlClasses} ${priorityStyles[taskData.priority]}`}>
                            <option >Low</option>
                            <option >Medium</option>
                            <option >High</option>
                        </select>
                    </div>

                    <div className=''>
                        <label className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-1'>
                        <Calendar className='w-4 h-4 text-purple-500'/>  Data Limite
                        </label>
                        <input type="date" name='dueDate' required min={today} value={taskData.dueDate} 
                            onChange={handleChange} className={baseControlClasses}/>
                    </div>
                </div>

                <div>
                    <label className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-2'>
                        <CheckCircle className='w-4 h-4 text-purple-500'/>  Status
                    </label>

                    <div className='flex gap-4'>
                        {[{val : "Yes", label : "Concluida"},{val: "No", label: "Em Progresso"}].map(({val, label}) => (
                            <label key={val} className='flex items-center'>
                                <input type="radio" name="completed" value={val} checked={taskData.completed === val}
                                    onChange={handleChange} className='h-4 w-4 text-purple-600
                                    focus:ring-purple-500 border-gray-300 rounded '/>
                                    <span className='ml-2 text-sm text-gray-700'>{label}</span>
                            </label>
                        ))}
                    </div>
                </div>
                    <button type='submit' disabled={loading} className='w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white 
                    font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 
                    hover:shadow-md transition-all duration-200'>
                        {loading ? "Salvando..." : (taskData.id ? <>
                        <Save className='w-4 h-4' /> Atualizar Tarefa
                        </> : <>
                        <PlusCircle className='w-4 h-4' /> Criar Tarefa
                        </>)}
                    </button>

            </form>

        </div>
    </div>
  )
}

export default TaskModal 