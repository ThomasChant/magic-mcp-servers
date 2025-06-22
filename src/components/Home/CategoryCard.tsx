import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
    to: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    serverCount: string;
    bgColor: string;
    iconBgColor: string;
    textColor: string;
}

const CategoryCard: React.FC<CategoryCardProps> = React.memo(({
    to,
    icon,
    title,
    description,
    serverCount,
    bgColor,
    iconBgColor,
    textColor
}) => {
    return (
        <Link
            to={to}
            className={`${bgColor} rounded-xl p-6 cursor-pointer border ${bgColor.includes('dark:') ? 'border-blue-800' : 'border-blue-100'} transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg`}
        >
            <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center mb-4`}>
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                {description}
            </p>
            <div className={`${textColor} font-medium text-sm`}>
                {serverCount}
            </div>
        </Link>
    );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;