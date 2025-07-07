import React from 'react';
import { Category } from '../types';

interface CategoryMenuProps {
    categories: Category[];
    onSelectCategory: (category: Category) => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ categories, onSelectCategory }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Categorías</h3>
            <ul className="space-y-1">
                {categories.map(category => (
                    <li key={category.id}>
                        <button
                            onClick={() => onSelectCategory(category)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors duration-200 text-left group"
                        >
                            <span className="w-6 h-6 flex items-center justify-center">{category.icon}</span>
                            <span className="font-medium text-sm">{category.name}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CategoryMenu;