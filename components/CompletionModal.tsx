import React from 'react';
import { CheckCircleIcon, PrinterIcon, MailIcon } from './icons/InterfaceIcons';

interface CompletionModalProps {
    onNext: () => void;
    total: number;
}

const CompletionModal: React.FC<CompletionModalProps> = ({ onNext, total }) => (
    <div className="absolute inset-0 bg-green-500/95 z-30 flex flex-col items-center justify-center text-white animate-fade-in-up">
        <CheckCircleIcon className="w-32 h-32" />
        <h2 className="text-5xl font-bold mt-8">Pago Aprobado</h2>
        <p className="text-2xl mt-2">Total pagado: Bs. {total.toFixed(2)}</p>
        <div className="flex gap-4 mt-12">
            <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg text-lg"><PrinterIcon /> Imprimir Ticket</button>
            <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg text-lg"><MailIcon /> Enviar por Email</button>
        </div>
        <button onClick={onNext} className="mt-12 bg-white text-green-600 font-bold text-2xl py-4 px-16 rounded-xl shadow-lg hover:scale-105 transition-transform">
            Siguiente Cliente
        </button>
    </div>
);

export default CompletionModal;