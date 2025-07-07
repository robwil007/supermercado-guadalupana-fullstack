

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/InterfaceIcons';

interface ProductCarouselProps {
    products: Product[];
}

// Throttle utility to limit how often a function can be called.
const throttle = (func: (...args: any[]) => void, delay: number) => {
    let inProgress = false;
    return (...args: any[]) => {
        if (inProgress) {
            return;
        }
        inProgress = true;
        setTimeout(() => {
            func(...args);
            inProgress = false;
        }, delay);
    };
};


const ProductCarousel: React.FC<ProductCarouselProps> = ({ products }) => {
    const scrollContainer = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollability = useCallback(() => {
        const container = scrollContainer.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setCanScrollLeft(scrollLeft > 5);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    }, []);

    useEffect(() => {
        const container = scrollContainer.current;
        if (container) {
            const throttledCheck = throttle(checkScrollability, 100);
            checkScrollability();
            container.addEventListener('scroll', throttledCheck);
            window.addEventListener('resize', throttledCheck);
            return () => {
                container.removeEventListener('scroll', throttledCheck);
                window.removeEventListener('resize', throttledCheck);
            };
        }
    }, [products, checkScrollability]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainer.current) {
            const scrollAmount = scrollContainer.current.clientWidth * 0.75;
            scrollContainer.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };
    
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className="relative group">
            <button
                onClick={() => scroll('left')}
                className="absolute top-1/2 -left-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 hover:bg-white disabled:opacity-0 disabled:cursor-not-allowed"
                aria-label="Scroll left"
                disabled={!canScrollLeft}
            >
                <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
            </button>

            <div ref={scrollContainer} className="overflow-x-auto pb-4 scrollbar-hide -mx-2">
                <div className="flex space-x-4 px-2">
                    {products.map(product => (
                        <div key={product.id} className="w-56 flex-shrink-0">
                            <ProductCard product={product} size="small" />
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={() => scroll('right')}
                className="absolute top-1/2 -right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 hover:bg-white disabled:opacity-0 disabled:cursor-not-allowed"
                aria-label="Scroll right"
                disabled={!canScrollRight}
            >
                <ChevronRightIcon className="w-6 h-6 text-gray-700" />
            </button>
        </div>
    );
};

export default ProductCarousel;