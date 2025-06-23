import React from 'react';

interface SmartBreakTextProps {
    text: string;
    className?: string;
    maxLines?: number;
    breakPattern?: RegExp;
    title?: string;
}

const SmartBreakText: React.FC<SmartBreakTextProps> = ({
    text,
    className = '',
    maxLines = 2,
    breakPattern = /[-_.\s]/,
    title,
}) => {
    const smartBreak = (text: string): React.ReactNode => {
        // 如果文本很短，直接返回
        if (text.length <= 20) {
            return <span title={title || text}>{text}</span>;
        }

        // 寻找合适的断点
        const breakPoints: number[] = [];
        let match;
        const regex = new RegExp(breakPattern, 'g');
        
        while ((match = regex.exec(text)) !== null) {
            breakPoints.push(match.index + 1);
        }

        // 如果没有找到断点，或者文本适中，使用省略号策略
        if (breakPoints.length === 0 || text.length <= 30) {
            return (
                <span 
                    className="truncate block"
                    title={title || text}
                >
                    {text}
                </span>
            );
        }

        // 找到最佳断点（接近中间位置）
        const idealBreakPoint = text.length / 2;
        const bestBreakPoint = breakPoints.reduce((best, current) => {
            return Math.abs(current - idealBreakPoint) < Math.abs(best - idealBreakPoint) 
                ? current 
                : best;
        });

        const firstPart = text.substring(0, bestBreakPoint).trim();
        const secondPart = text.substring(bestBreakPoint).trim();

        // 如果第二部分太长，也进行截断
        const maxSecondPartLength = 25;
        const displaySecondPart = secondPart.length > maxSecondPartLength 
            ? secondPart.substring(0, maxSecondPartLength) + '...'
            : secondPart;

        return (
            <span title={title || text} className="leading-tight">
                <span className="block">{firstPart}</span>
                <span className="block text-sm opacity-90">{displaySecondPart}</span>
            </span>
        );
    };

    return (
        <div 
            className={`${className}`}
            style={{ 
                display: '-webkit-box',
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
            }}
        >
            {smartBreak(text)}
        </div>
    );
};

export default SmartBreakText;