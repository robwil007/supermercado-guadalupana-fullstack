import React from 'react';
import { Product, Category, PromoBanner } from './types';
import { AppleIcon, MilkIcon, MeatIcon, BreadIcon, CandyIcon, BottleIcon, DropletIcon, ShirtIcon, SparklesIcon, TagIcon, CarrotIcon, CoffeeIcon, SandwichIcon } from './components/icons/CategoryIcons';

export const categories: Category[] = [
    { id: 'ofertas-cat', name: 'Ofertas y Promociones', icon: <TagIcon /> },
    { id: 'frutas-verduras', name: 'Frutas y Verduras', icon: <CarrotIcon /> },
    { id: 'lacteos-huevos', name: 'Lácteos y Huevos', icon: <MilkIcon /> },
    { id: 'carnes-aves', name: 'Carnes y Aves', icon: <MeatIcon /> },
    { id: 'panaderia', name: 'Panadería', icon: <BreadIcon /> },
    { id: 'despensa', name: 'Despensa', icon: <BottleIcon /> },
    { id: 'dulces-snacks', name: 'Dulces y Snacks', icon: <CandyIcon />, subcategories: ['Todos', 'Favoritos', 'Chocolates', 'Caramelos', 'Galletas'] },
    { id: 'bebidas', name: 'Bebidas', icon: <DropletIcon /> },
    { id: 'cuidado-personal', name: 'Cuidado Personal', icon: <ShirtIcon /> },
    { id: 'limpieza', name: 'Limpieza', icon: <SparklesIcon /> },
    { id: 'comida-lista', name: 'Comida Lista', icon: <SandwichIcon /> },
    { id: 'cafe-te', name: 'Café y Té', icon: <CoffeeIcon /> },
];

export const products: Product[] = [
    { id: 'P001', name: 'Manzanas Rojas', description: 'Frescas y jugosas', price: 10, weight: '1kg', image: 'https://i.ibb.co/FbfyzVp/manzanas-rojas.png', category: 'Frutas y Verduras', discountPercent: 15, stock: 100 },
    { id: 'P002', name: 'Leche PIL', description: 'Leche entera pasteurizada', price: 6, weight: '1L', image: 'https://i.ibb.co/b3vXXst/leche-pil.png', category: 'Lácteos y Huevos', stock: 100 },
    { id: 'P003', name: 'Pechuga de Pollo', description: 'Pollo fresco de granja', price: 25, weight: '1kg', image: 'https://i.ibb.co/yQJ4pW7/pechuga-pollo.png', category: 'Carnes y Aves', stock: 100 },
    { id: 'P004', name: 'Pan Marraqueta', description: 'Recién horneado', price: 1, weight: 'unidad', image: 'https://i.ibb.co/YTBm0sM/pan-marraqueta.png', category: 'Panadería', stock: 100 },
    { id: 'P005', name: 'Arroz Grano de Oro', description: 'Arroz popular', price: 12, weight: '1kg', image: 'https://i.ibb.co/xL1sD0z/arroz.png', category: 'Despensa', discountPercent: 10, stock: 100 },
    { id: 'P006', name: 'Bounty Minis', price: 8, weight: '200g', image: 'https://i.ibb.co/6r0M7k8/bounty.png', category: 'Dulces y Snacks', tags: ['Chocolates'], bundleOffers: [{ quantity: 3, price: 20 }], stock: 100 },
    { id: 'P007', name: 'Coca-Cola 2L', description: 'Bebida gaseosa refrescante', price: 10, weight: '2L', image: 'https://i.ibb.co/FzTgJv5/coca-cola.png', category: 'Bebidas', bundleOffers: [{ quantity: 6, price: 55 }, { quantity: 12, price: 100 }], stock: 100 },
    { id: 'P008', name: 'Jabón Dove', description: 'Barra de belleza', price: 7, weight: '90g', image: 'https://i.ibb.co/C0bN2bt/jabon-dove.png', category: 'Cuidado Personal', stock: 100 },
    { id: 'P009', name: 'Detergente OLA', description: 'Para ropa blanca y de color', price: 30, weight: '2kg', image: 'https://i.ibb.co/C692pYT/detergente-ola.png', category: 'Limpieza', stock: 120 },
    { id: 'P010', name: 'Yogurt Griego', description: 'Natural y sin azúcar', price: 9, weight: '150g', image: 'https://i.ibb.co/MGDxS6f/yogurt-griego.png', category: 'Lácteos y Huevos', discountPercent: 5, stock: 100 },
    { id: 'P011', name: 'Tomates', description: 'Tomates frescos para ensalada', price: 8, weight: '1kg', image: 'https://i.ibb.co/xHHFp6V/tomates.png', category: 'Frutas y Verduras', stock: 100 },
    { id: 'P012', name: 'Café Copacabana', description: 'Café tostado y molido', price: 35, weight: '250g', image: 'https://i.ibb.co/QMgW4F0/cafe-copacabana.png', category: 'Café y Té', stock: 100 },
    { id: 'P013', name: 'Queso Feta Criollo', price: 25, weight: '200g', image: 'https://i.ibb.co/Yc5pWb8/queso-feta.png', category: 'Lácteos y Huevos', discountPercent: 22, stock: 100 },
    { id: 'P014', name: 'Queso Mozzarella', price: 28, weight: '200g', image: 'https://i.ibb.co/TqYn0rq/queso-mozzarella.png', category: 'Lácteos y Huevos', stock: 100 },
    { id: 'P015', name: 'Queso Gouda Liebedank', price: 38, weight: '300g', image: 'https://i.ibb.co/RpdDkF9/queso-gouda.png', category: 'Lácteos y Huevos', bundleOffers: [{ quantity: 2, price: 70 }], stock: 100 },
    { id: 'P016', name: 'Snickers Minis', price: 15, weight: '200g', image: 'https://i.ibb.co/8DwxBDs/snickers.png', category: 'Dulces y Snacks', tags: ['Chocolates', 'Favoritos'], stock: 100 },
    { id: 'P017', name: 'Skittles Frutas', price: 5, weight: '38g', image: 'https://i.ibb.co/mHkKtN6/skittles.png', category: 'Dulces y Snacks', discountPercent: 10, tags: ['Caramelos', 'Favoritos'], stock: 8 },
    { id: 'P018', name: 'M&M\'s Chocolate', price: 7, weight: '45g', image: 'https://i.ibb.co/P4JbW8k/mms-choco.png', category: 'Dulces y Snacks', discountPercent: 10, tags: ['Chocolates'], stock: 5 },
    { id: 'P019', name: 'M&M\'s Maní', price: 19, weight: '145g', image: 'https://i.ibb.co/VQLpSPy/mms-peanut.png', category: 'Dulces y Snacks', discountPercent: 10, tags: ['Chocolates', 'Favoritos'], stock: 100 },
    { id: 'P020', name: 'Galletas Chio Rio', price: 10, weight: '200g', image: 'https://i.ibb.co/k0gXfJ2/chio-rio.png', category: 'Dulces y Snacks', tags: ['Galletas'], stock: 100 },
    { id: 'P021', name: 'Huevos de Granja', price: 15, weight: 'Docena', image: 'https://i.ibb.co/L8y81tS/huevos.png', category: 'Lácteos y Huevos', stock: 15 },
];

export const promoBanners: PromoBanner[] = [
    { id: 1, title: '¡Precios por el piso!', description: '50% en productos seleccionados', imageUrl: 'https://i.ibb.co/P94x2sK/promo-banner-1.png', bgColor: 'bg-orange-100' },
    { id: 2, title: 'Menú del Día', description: 'Ahorra comprando combos', imageUrl: 'https://i.ibb.co/xJdcR7N/promo-banner-2.png', bgColor: 'bg-green-100' },
    { id: 3, title: 'Comida Lista', description: 'Deliciosos platos listos para servir', imageUrl: 'https://i.ibb.co/fDbP2S6/promo-banner-3.png', bgColor: 'bg-pink-100' },
];
