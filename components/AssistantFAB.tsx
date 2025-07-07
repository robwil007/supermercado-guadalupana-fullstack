

import React from 'react';
import { useUI } from '../context/AppContext';
import GuadaAvatar from './GuadaAvatar';

const AssistantFAB: React.FC = () => {
    const { openChatModal } = useUI();

    return (
        <button
            onClick={openChatModal}
            className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 z-40"
            aria-label="Abrir asistente de compras"
        >
            <GuadaAvatar />
        </button>
    );
};

export default AssistantFAB;