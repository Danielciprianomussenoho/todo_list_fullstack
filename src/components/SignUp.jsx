import { UserPlus } from 'lucide-react'
import React, { useState } from 'react'
import {BUTTONCLASSES, FIELDS, Inputwrapper, MESSAGE_ERROR, MESSAGE_SUCCESS} from "../assets/dummy"
import axios from 'axios';
import { API_BASE } from "../config/api";


const INITIAL_FORM = {
  name: '',
  email: '',
  password: ''
};

const SignUp = ({onSwitchMode}) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({text: '', type: ''});

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({text: '', type: ''});

    try {
      const {data} = await axios.post(`${API_BASE}/api/user/register`, formData);
      console.log("Cadastrado com sucesso", data);
      setMessage({text: 'Cadastro realizado com sucesso! Você já pode fazer login.', type: 'success'});
      setFormData(INITIAL_FORM);
    } catch (err) {
      console.error("Cadastro Falhou", err);
      setMessage({text: err.response?.data?.message || 'Erro ao cadastrar, Tente novamente.', type: 'error'});
    } finally {
      setLoading(false);
    }
   };

  return (
    <div className='max-w-md w-full bg-white shadow-lg border border-purple-100 rounded-xl p-8'>
      <div className='mb-6 text-center'>
        <div className='w-16 h-16 mx-auto bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center mb-4'>
          <UserPlus className='w-8 h-8 text-white' />
        </div>
        <h2 className='text-2xl font-bold text-gray-800'>Criar Conta</h2>
        <p className='text-gray-500 text-sm mt-1'>Junte-se ao Anote ai. Para Gerenciar Suas Tarefas.</p>
      </div>

      {message.text && (
        <div className={message.type === "success" ? MESSAGE_SUCCESS : MESSAGE_ERROR}>
          {message.text}
        </div>
      )}

      <form  onSubmit={handleSubmit} className='space-y-4'>
         {FIELDS.map(({name, type, placeholder, icon: Icon}) => (
          <div key={name} className={Inputwrapper}>
            <Icon className='text-purple-500 w-5 h-5 mr-2' />

            <input
              type={type}
              placeholder={placeholder}
              value={formData[name]}
              onChange={(e) => setFormData({...formData, [name]: e.target.value})}
              className='w-full focus:outline-none text-gray-700 text-sm'
            />
          </div>
         ))}

          <button type='submit' disabled={loading} className={BUTTONCLASSES}>
            {loading ? 'Cadastrando...' : <><UserPlus className='w-4 h-4' />Cadastrar</>}
          </button>
      </form>

      <p className='text-center text-sm text-gray-600 mt-4'>
        Já tem uma conta?{" "} <button onClick={onSwitchMode} className='text-purple-600 hover:text-purple-700 hover:underline'>Faça login</button>
      </p>
    </div>
  )
}

export default SignUp 