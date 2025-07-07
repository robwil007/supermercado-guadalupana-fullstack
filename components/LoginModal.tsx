import React, { useState } from 'react';
import { useAuth, useUI } from '../context/AppContext';
import Logo from './Logo';
import { XIcon, LoaderIcon } from './icons/InterfaceIcons';

const LoginModal: React.FC = () => {
    const { register, login, authLoading, authError } = useAuth();
    const { closeLoginModal } = useUI();
    const [isRegistering, setIsRegistering] = useState(true);
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [contactMethod, setContactMethod] = useState<'telegram' | 'whatsapp'>('whatsapp');
    const [contactId, setContactId] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isRegistering) {
            if (name && email && phone && contactId) {
                await register({ name, email, phone, contactMethod, contactId }).catch(err => console.error(err));
            }
        } else {
            if (email) {
                await login(email).catch(err => console.error(err));
            }
        }
    };

    const handleSetContactMethod = (method: 'telegram' | 'whatsapp') => {
        setContactMethod(method);
        setContactId('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative animate-fade-in-up">
                <button
                    onClick={closeLoginModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                >
                    <XIcon />
                </button>
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <Logo />
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                        {isRegistering ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
                    </h2>
                    <p className="text-center text-gray-500 mb-8">
                        {isRegistering ? 'Ingresa tus datos para continuar' : 'Ingresa tu correo para continuar'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegistering && (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-gray-700" htmlFor="name">Nombre Completo</label>
                                    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="Ej: Juan Pérez" required/>
                                </div>
                            </>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-700" htmlFor="email">Correo Electrónico</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="tu.correo@ejemplo.com" required/>
                        </div>
                        {isRegistering && (
                             <>
                                <div>
                                    <label className="text-sm font-medium text-gray-700" htmlFor="phone">Número de Celular</label>
                                    <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="Ej: 76543210" required/>
                                </div>
                                <div className="pt-2">
                                     <label className="text-sm font-medium text-gray-700">Contacto preferido</label>
                                     <div className="mt-2 grid grid-cols-2 gap-3">
                                        <button type="button" onClick={() => handleSetContactMethod('whatsapp')} className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition ${contactMethod === 'whatsapp' ? 'bg-primary/10 border-primary ring-2 ring-primary' : 'border-gray-300'}`}>WhatsApp</button>
                                        <button type="button" onClick={() => handleSetContactMethod('telegram')} className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition ${contactMethod === 'telegram' ? 'bg-primary/10 border-primary ring-2 ring-primary' : 'border-gray-300'}`}>Telegram</button>
                                     </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700" htmlFor="contactId">
                                        {contactMethod === 'whatsapp' ? 'Tu número de WhatsApp' : 'Tu usuario de Telegram'}
                                    </label>
                                    <input
                                        id="contactId"
                                        type={contactMethod === 'whatsapp' ? 'tel' : 'text'}
                                        value={contactId}
                                        onChange={(e) => setContactId(e.target.value)}
                                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        placeholder={contactMethod === 'whatsapp' ? 'Ej: 76543210' : 'Ej: @tu_usuario'}
                                        required
                                    />
                                </div>
                            </>
                        )}
                        
                        {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={authLoading}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center disabled:bg-gray-400"
                            >
                                {authLoading ? <LoaderIcon /> : (isRegistering ? 'Crear Cuenta' : 'Ingresar')}
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-4">
                        <button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-primary hover:underline font-medium">
                            {isRegistering ? '¿Ya tienes una cuenta? Ingresa aquí' : '¿No tienes una cuenta? Regístrate'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;