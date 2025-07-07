import React from 'react';

const Logo: React.FC = () => (
    <div className="flex items-center gap-3 cursor-pointer">
         <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1_2)">
                <path d="M20 0C31.0457 0 40 8.9543 40 20C40 31.0457 31.0457 40 20 40C8.9543 40 0 31.0457 0 20C0 8.9543 8.9543 0 20 0Z" fill="#E53935"/>
                <path d="M26.4023 27.0508C28.293 25.1523 29.2187 22.5156 29.0469 19.8281C28.875 17.1406 27.6172 14.6484 25.5586 12.8711C23.5 11.0937 20.8242 10.1875 18.0937 10.3281C15.3633 10.4687 12.832 11.6484 10.9766 13.5937L14.3945 16.9961C15.4297 15.9687 16.8516 15.3906 18.332 15.4219C19.8125 15.4531 21.2148 16.0937 22.2266 17.1562C23.2383 18.2187 23.7852 19.6016 23.7539 21.0156C23.7227 22.4297 23.1172 23.7773 22.0859 24.7734L20 22.6875V18.75H14.375V26.25H20L26.4023 27.0508Z" fill="#FFFFFF"/>
                <path d="M28.0312 8.01562L25.3125 10.7031L22.5938 8.01562L25.3125 5.32812L28.0312 8.01562Z" fill="#FFD700"/>
            </g>
            <defs>
                <clipPath id="clip0_1_2">
                    <rect width="40" height="40" fill="white"/>
                </clipPath>
            </defs>
        </svg>
        <span className="text-xl md:text-2xl font-bold text-gray-800 hidden sm:block">Guadalupana</span>
    </div>
);

export default Logo;
