
import React from 'react';
import { Theme } from '../types';

export const Header: React.FC<{ title: string; onBack?: () => void; onHome?: () => void; showGallery?: boolean; onGallery?: () => void; theme: Theme; onToggleTheme: () => void; }> = ({ title, onBack, onHome, showGallery, onGallery, theme, onToggleTheme }) => (
  <header className="bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between sticky top-0 z-10">
    <div className="flex items-center space-x-2">
      {onBack && <Button onClick={onBack} variant="secondary">Back</Button>}
      {onHome && <Button onClick={onHome} variant="secondary">Home</Button>}
    </div>
    <h1 className="text-xl font-bold text-slate-700 dark:text-slate-200">{title}</h1>
    <div className="flex items-center space-x-2">
      <Button onClick={onToggleTheme} variant="secondary" className="px-3">
        {theme === 'light' ? '🌙' : '☀️'}
      </Button>
      {showGallery && <Button onClick={onGallery} variant="primary">View Gallery</Button>}
    </div>
  </header>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}
export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const baseClasses = "rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 shadow-sm hover:shadow-md dark:bg-blue-600 dark:hover:bg-blue-700',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md dark:bg-red-700 dark:hover:bg-red-800',
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  return <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>{children}</button>;
};

export const Card: React.FC<{ children: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 ${className}`} {...props}>{children}</div>
);

export const SelectInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[] }> = ({ label, value, onChange, options }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
    <select value={value} onChange={onChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white">
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export const NumberInput: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; units?: string }> = ({ label, value, onChange, units }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
    <div className="flex items-center">
      <input type="number" value={value} onChange={onChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
      {units && <span className="ml-2 text-slate-500 dark:text-slate-400">{units}</span>}
    </div>
  </div>
);

export const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-white text-xl mt-4 font-semibold">{message}</p>
    </div>
);