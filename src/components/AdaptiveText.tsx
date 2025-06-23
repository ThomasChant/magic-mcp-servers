import React, { useEffect, useRef, useState } from 'react';

interface AdaptiveTextProps {
    text: string;
    className?: string;
    maxSize?: number;
    minSize?: number;
    title?: string;
    children?: React.ReactNode;
}

const AdaptiveText: React.FC<AdaptiveTextProps> = ({
    text,
    className = '',
    maxSize = 18,
    minSize = 12,
    title,
    children,
}) => {
    const textRef = useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = useState(maxSize);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        const element = textRef.current;
        if (!element) return;

        const checkOverflow = () => {
            // 重置字体大小到最大值
            element.style.fontSize = `${maxSize}px`;
            
            // 检查是否溢出
            const isOverflow = element.scrollWidth > element.clientWidth;
            setIsOverflowing(isOverflow);
            
            if (isOverflow) {
                // 计算适合的字体大小
                let currentSize = maxSize;
                while (currentSize > minSize && element.scrollWidth > element.clientWidth) {
                    currentSize -= 1;
                    element.style.fontSize = `${currentSize}px`;
                }
                setFontSize(currentSize);
            } else {
                setFontSize(maxSize);
            }
        };

        // 初始检查
        checkOverflow();

        // 监听窗口大小变化
        const resizeObserver = new ResizeObserver(() => {
            checkOverflow();
        });

        if (element.parentElement) {
            resizeObserver.observe(element.parentElement);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [text, maxSize, minSize]);

    return (
        <div
            ref={textRef}
            className={`${className} ${isOverflowing ? 'cursor-help' : ''}`}
            style={{ fontSize: `${fontSize}px` }}
            title={isOverflowing ? title || text : undefined}
        >
            {children || text}
        </div>
    );
};

export default AdaptiveText;