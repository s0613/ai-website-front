import React from 'react';

type ButtonProps = {
    label: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
};

const Button: React.FC<ButtonProps> = ({ label, onClick, type = 'button', className = '' }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`flex justify-center w-full px-6 py-3 text-base font-semibold text-white bg-black border border-transparent rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${className}`}
        >
            {label}
        </button>
    );
};

export default Button;