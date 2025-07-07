

import React, { useState, useRef, useEffect } from 'react';
import { useUI, useData, useCart } from '../context/AppContext';
import { XIcon, SendIcon, LoaderIcon } from './icons/InterfaceIcons';
import ProductCard from './ProductCard';
import GuadaAvatar from './GuadaAvatar';

const ChatModal: React.FC = () => {
    const { closeChatModal } = useUI();
    const {
        chatHistory,
        chatLoading,
        sendChatMessage,
    } = useData();
    const { addToCart } = useCart();
    const [message, setMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, chatLoading]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !chatLoading) {
            sendChatMessage(message);
            setMessage('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 sm:items-center">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-2xl h-[90vh] sm:h-[80vh] flex flex-col animate-fade-in-up">
                {/* Header */}
                <div className="p-4 bg-gray-100 rounded-t-2xl flex items-center justify-between flex-shrink-0 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10">
                            <GuadaAvatar />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Guada</h2>
                            <p className="text-sm text-green-600 font-semibold">En línea</p>
                        </div>
                    </div>
                    <button onClick={closeChatModal} className="text-gray-400 hover:text-gray-700 p-2">
                        <XIcon />
                    </button>
                </div>

                {/* Chat History */}
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {chatHistory.map((chat, index) => (
                        <div key={index} className={`flex items-end gap-2 ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {chat.role === 'assistant' && (
                                 <div className="w-8 h-8 self-start flex-shrink-0">
                                    <GuadaAvatar />
                                </div>
                            )}
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-2 ${chat.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                <p className="whitespace-pre-wrap">{chat.content}</p>
                                {chat.products && chat.products.length > 0 && (
                                    <div className="mt-3 border-t border-gray-300 pt-3">
                                        <h4 className="font-bold text-sm mb-2">Te recomiendo estos productos:</h4>
                                        <div className="space-y-2">
                                            {chat.products.map(p => (
                                                <div key={p.id} className="bg-white p-2 rounded-lg flex items-center gap-2 shadow-sm">
                                                    <img src={p.image} alt={p.name} className="w-12 h-12 object-contain rounded"/>
                                                    <div className="flex-grow">
                                                        <p className="text-sm font-semibold">{p.name}</p>
                                                        <p className="text-xs text-gray-600">Bs. {p.price.toFixed(2)}</p>
                                                    </div>
                                                    <button onClick={() => addToCart(p)} className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md hover:bg-primary/20 transition-colors">Añadir</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                     {chatLoading && (
                        <div className="flex items-end gap-2 justify-start">
                             <div className="w-8 h-8 self-start flex-shrink-0">
                                <GuadaAvatar />
                             </div>
                             <div className="max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 bg-gray-200 text-gray-800 rounded-bl-none flex items-center gap-2">
                                <LoaderIcon className="text-primary"/>
                                <span className="text-sm font-medium">Guada está escribiendo...</span>
                            </div>
                        </div>
                     )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t flex-shrink-0">
                    <form onSubmit={handleSend} className="relative">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escribe tu mensaje..."
                            className="w-full bg-gray-100 border border-gray-200 rounded-full py-3 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            disabled={chatLoading}
                        />
                        <button
                            type="submit"
                            disabled={chatLoading || !message.trim()}
                            className="absolute inset-y-0 right-0 flex items-center justify-center bg-primary text-white rounded-full w-10 h-10 my-1.5 mx-2 disabled:bg-gray-300 transition-colors"
                        >
                            <SendIcon />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;