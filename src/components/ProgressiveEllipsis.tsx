import React from 'react';

interface ProgressiveEllipsisProps {
    text: string;
    className?: string;
    maxLength?: number;
    preserveStart?: number;
    preserveEnd?: number;
    title?: string;
}

const ProgressiveEllipsis: React.FC<ProgressiveEllipsisProps> = ({
    text,
    className = '',
    maxLength = 20,
    preserveStart = 8,
    preserveEnd = 6,
    title,
}) => {
    const truncateText = (text: string): string => {
        if (text.length <= maxLength) {
            return text;
        }

        // 渐进式省略：保留开头和结尾的重要部分
        const start = text.substring(0, preserveStart);
        const end = text.substring(text.length - preserveEnd);
        
        return `${start}...${end}`;
    };

    const displayText = truncateText(text);
    const isEllipsed = displayText !== text;

    return (
        <span 
            className={`${className} ${isEllipsed ? 'cursor-help' : ''}`}
            title={isEllipsed ? (title || text) : undefined}
            style={{ display: 'inline-block' }}
        >
            {displayText}
        </span>
    );
};

export default ProgressiveEllipsis;