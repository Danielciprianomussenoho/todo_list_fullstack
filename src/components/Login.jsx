import { Eye, EyeOff, Lock, LogIn, Mail, UserPlus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {toast, ToastContainer} from "react-toastify"
import {BUTTON_CLASSES, Inputwrapper} from "../assets/dummy"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const INITIAL_FORM = { email: '',  password: ''};

const Login = ({onSubmit, onSwitchMode}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate()
  const url = 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (token) {
      (async () => {
        try {
          const { data } = await axios.get(`${url}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if(data.success){
            onSubmit?.({ token, userId, ...data.user });
            toast.success("Sessão restaurada. Redirecionando...");
            navigate('/');
          }else{
           localStorage.clear()
          }
        } catch {
          localStorage.clear();
        }
      })();
    }
  }, [navigate, onSubmit]);

 const handleSubmit = async (e) => {
    e.preventDefault();
    if(!rememberMe) {
      toast.error("Você deve aceitar o 'Lembrar-me' para continuar.");
      return;
    }
    setLoading(true);

    try {
      const {data} = await axios.post(`${url}/api/user/login`, formData);
      if(!data.token) throw new Error(data.message || 'Token não recebido. Login falhou.');

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id );
      setFormData(INITIAL_FORM);
      onSubmit?.({token: data.token, userId: data.user.id, ...data.user});
      toast.success("Login realizado com sucesso! Redirecionando...");
      setTimeout(() => navigate('/'), 1000 );
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
   };

  const HandleSwitchMode = () => {
  toast.dismiss()
  onSwitchMode?.()
 } 
  
 const fields = [
    { name: "email", type: "email", placeholder: "Email", icon: Mail },
    { name: "password", type: showPassword ? "text" : "password", placeholder: "Password", icon: Lock, isPassword: true },
];

  return (
    <div className='max-w-md w-full bg-white shadow-lg border border-purple-100 rounded-xl p-8'>
      <ToastContainer position='top-center' autoClose={3000} hideProgressBar />

      <div className='mb-6 text-center'>
        <div className='w-16 h-16 mx-auto bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center mb-4'>
          <LogIn className='w-8 h-8 text-white' />
        </div>
        <h2 className='text-2xl font-bold text-gray-800'>Bem-Vindo de Volta</h2>
        <p className='text-gray-500 text-sm mt-1'>Faça Login para Continuar a Gerenciar Suas Tarefas.</p>
      </div>

      <form  onSubmit={handleSubmit} className='space-y-4'>
         {fields.map(({name, type, placeholder, icon:Icon , isPassword}) => (
          <div key={name} className={Inputwrapper}>
            <Icon className='text-purple-500 w-5 h-5 mr-2' />

            <input
              type={type}
              placeholder={placeholder}
              value={formData[name]}
              onChange={(e) => setFormData({...formData, [name]: e.target.value})}
              className='w-full focus:outline-none text-gray-700 text-sm' required
            />
            {isPassword && (
              <button type='button' onClick={()=>setShowPassword((prev => !prev))} className='ml-2 text-gray-500 hover:text-purple-500 transition-colors'>
                {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
              </button>
            )}
          </div>
         ))}

          <div className='flex items-center'>           
              <input type='checkbox' checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} id='rememberMe ' className="h-4 w-4 text-purple-500 focus:ring-purple-400 border-e-gray-300 rounded" required />
              <label htmlFor="rememberMe" className='text-gray-700 ml-2 block text-sm'>Lembrar-me</label> 
          </div>

          <button type='submit' disabled={loading} className={BUTTON_CLASSES}>
            {loading ? (
              'Entrando...' 
            ): (
              <>
                <LogIn className='w-4 h-4' />
                Login
              </>
            )}
          </button>
      </form>

      <p className='text-center text-sm text-gray-600 mt-6'>
        Não tem uma conta?{" "} <button type='button' onClick={HandleSwitchMode} className='text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors'>Cadastrar-se</button>
      </p>
    </div>
  )
}

export default Login 