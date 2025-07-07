
import React from 'react';
import { PromoBanner } from '../types';

interface PromoBannersProps {
    banners: PromoBanner[];
}

const PromoBanners: React.FC<PromoBannersProps> = ({ banners }) => {
    return (
        <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
            {banners.map(banner => (
                <div key={banner.id} className={`flex-shrink-0 w-80 h-40 rounded-xl overflow-hidden shadow-lg ${banner.bgColor} flex items-center`}>
                    <div className="w-1/2 p-4 text-gray-800">
                        <h3 className="font-bold text-xl">{banner.title}</h3>
                        <p className="text-sm">{banner.description}</p>
                    </div>
                    <div className="w-1/2 h-full">
                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PromoBanners;
