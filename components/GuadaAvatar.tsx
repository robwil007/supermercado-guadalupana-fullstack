import React from 'react';

const GuadaAvatar: React.FC = () => {
    return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Face */}
            <circle cx="50" cy="50" r="35" fill="#FFE0B2"/>
            {/* Hair */}
            <path d="M35 35 C 40 20, 60 20, 65 35 L 68 55 C 60 65, 40 65, 32 55 Z" fill="#6D4C41"/>
            {/* Eyes */}
            <circle cx="42" cy="48" r="4" fill="#424242"/>
            <circle cx="58" cy="48" r="4" fill="#424242"/>
            {/* Mouth */}
            <path d="M45 60 Q 50 65, 55 60" stroke="#C62828" strokeWidth="2" fill="none" strokeLinecap="round"/>
            {/* Wings */}
            <g>
                {/* Left Wing */}
                <path d="M30 50 C 10 40, 10 70, 30 75 Z" fill="#E0E0E0"/>
                <path d="M30 50 C 10 40, 10 70, 30 75 Z" stroke="#9E9E9E" strokeWidth="1" fill="none"/>
                <path d="M28 53 L 15 51" stroke="#D32F2F" strokeWidth="3" />
                <path d="M28 58 L 15 56" stroke="#FFC107" strokeWidth="3" />
                <path d="M28 63 L 15 61" stroke="#4CAF50" strokeWidth="3" />
            </g>
            <g transform="scale(-1, 1) translate(-100, 0)">
                 {/* Right Wing */}
                 <path d="M30 50 C 10 40, 10 70, 30 75 Z" fill="#E0E0E0"/>
                 <path d="M30 50 C 10 40, 10 70, 30 75 Z" stroke="#9E9E9E" strokeWidth="1" fill="none"/>
                 <path d="M28 53 L 15 51" stroke="#D32F2F" strokeWidth="3" />
                 <path d="M28 58 L 15 56" stroke="#FFC107" strokeWidth="3" />
                 <path d="M28 63 L 15 61" stroke="#4CAF50" strokeWidth="3" />
            </g>
        </svg>
    );
};

export default GuadaAvatar;
