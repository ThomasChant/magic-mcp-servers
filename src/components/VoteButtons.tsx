import React, { useMemo } from "react";
import { ThumbsUp, LogIn } from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useBatchScore } from "./BatchScoreProvider";
import { useBatchUserVote } from "./BatchUserVoteProvider";
import { useOptimisticVoting } from "../hooks/useOptimisticVoting";
import { isServerSide } from "../utils/environment";


// Simple notification function
const notify = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // TODO: Replace with proper toast system later
};

interface VoteButtonsProps {
    serverId: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showScore?: boolean;
}

/**
 * VoteButtons - Uses batch queries for optimal performance
 * Works for both single servers and multiple servers pages
 */
// SSR-safe VoteButtons component  
const VoteButtonsSSR: React.FC<VoteButtonsProps> = ({ className, showScore }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        {showScore && (
            <span className="text-gray-500 min-w-[3ch] text-center">0</span>
        )}
        <button 
            className="p-2 rounded-md transition-all text-gray-400 bg-gray-100 dark:bg-gray-800"
            disabled
        >
            <ThumbsUp className="w-4 h-4" />
        </button>
    </div>
);

// Client-side VoteButtons component
const VoteButtonsClient: React.FC<VoteButtonsProps> = ({
    serverId,
    size = 'md',
    className = '',
    showScore = true
}) => {
    // Client-side only: use Clerk hooks
    const user = useUser();
    const clerk = useClerk();
    const isSignedIn = user?.isSignedIn || false;
    const openSignIn = clerk?.openSignIn || (() => {});
    
    // 获取初始数据
    const { score: serverScore, isLoading: scoreLoading } = useBatchScore(serverId);
    const { userVote: batchUserVote, isLoading: voteLoading } = useBatchUserVote(serverId);
    
    // 缓存初始数据对象，避免每次渲染创建新对象
    const initialData = useMemo(() => ({
        userVote: batchUserVote,
        upvotes: serverScore?.upvotes || 0
    }), [batchUserVote, serverScore?.upvotes]);
    
    // 使用乐观投票hook
    const { userVote, upvotes, isVoting, vote, canVote } = useOptimisticVoting(serverId, initialData);
    
    // 防抖处理，避免重复点击
    const [lastClickTime, setLastClickTime] = React.useState<number>(0);

    // Handle "I'm using this" marking - 投票切换逻辑
    const handleUsage = () => {
        if (!isSignedIn) {
            openSignIn();
            return;
        }

        // 防抖：检查是否在短时间内重复点击
        const now = Date.now();
        if (now - lastClickTime < 500) {
            return;
        }
        setLastClickTime(now);

        // 如果正在投票，不允许重复点击
        if (!canVote || isVoting) {
            return;
        }

        // 自动处理切换逻辑
        vote('up');
        
        // 提供用户反馈
        if (userVote === 'up') {
            notify('Usage mark removed');
        } else {
            notify('Marked as using!');
        }
    };

    // Style configuration - clean single button layout
    const sizeConfig = {
        sm: {
            button: showScore ? 'w-6 h-6' : 'w-8 h-8',
            icon: showScore ? 'h-3 w-3' : 'h-4 w-4',
            score: 'text-xs font-medium px-1 min-w-[1.5rem]'
        },
        md: {
            button: 'w-8 h-8',
            icon: 'h-4 w-4',
            score: 'text-sm font-medium px-1 min-w-[2rem]'
        },
        lg: {
            button: 'w-10 h-10',
            icon: 'h-5 w-5',
            score: 'text-base font-medium px-1 min-w-[2.5rem]'
        }
    };

    const config = sizeConfig[size];
    const isLoading = scoreLoading || voteLoading;
    const isDisabled = isLoading || !isSignedIn || isVoting;

    // Button style - 改进加载状态的视觉反馈
    const getButtonStyle = () => {
        const roundedStyle = showScore ? 'rounded-full' : 'rounded-lg';
        const baseStyle = `flex items-center justify-center ${roundedStyle} transition-all duration-150 ${config.button}`;
        const isSelected = userVote === 'up';
        const isVotingInProgress = isVoting;

        // 投票中状态 - 显示红色加载状态
        if (isVotingInProgress) {
            if (!showScore) {
                return `${baseStyle} text-red-500 bg-red-50 border border-red-200 cursor-not-allowed dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 opacity-75`;
            }
            return `${baseStyle} text-red-500 cursor-not-allowed dark:text-red-400 opacity-75`;
        }

        // 其他禁用状态
        if (isDisabled) {
            return `${baseStyle} text-gray-300 cursor-not-allowed dark:text-gray-600`;
        }

        if (!showScore) {
            return isSelected
                ? `${baseStyle} text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30`
                : `${baseStyle} text-gray-900 bg-gray-50 border border-gray-200 hover:bg-gray-100 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700`;
        }

        return isSelected
            ? `${baseStyle} text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20`
            : `${baseStyle} text-gray-900 hover:text-red-500 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20`;
    };

    // User count style - 基于当前用户是否投票，而不是总投票数
    const getScoreStyle = () => {
        const baseStyle = `text-center flex items-center justify-center ${config.score}`;
        
        // 如果当前用户投票了，显示红色；否则显示黑色/灰色
        if (userVote === 'up') {
            return `${baseStyle} text-red-600 dark:text-red-400`;
        } else {
            return `${baseStyle} text-gray-900 dark:text-gray-300`;
        }
    };

    // Login prompt
    if (!isSignedIn) {
        const buttonClass = showScore ? 'w-6 h-6' : 'w-8 h-8';
        const iconClass = showScore ? 'h-3 w-3' : 'h-4 w-4';
        const buttonStyle = showScore 
            ? `flex items-center justify-center ${buttonClass} bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition-all duration-150 dark:bg-red-900/20 dark:text-red-400`
            : `flex items-center justify-center ${buttonClass} bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-150 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700`;
        
        return (
            <div className={`flex items-center  ${className}`}>
                <button
                    onClick={() => openSignIn()}
                    className={buttonStyle}
                    title={`Sign in to mark as using (${upvotes} users)`}
                >
                    <LogIn className={iconClass} />
                </button>
                {showScore && (
                    <div className={getScoreStyle()}>
                        {upvotes} users
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`flex items-center  ${className}`}>
            {/* I'm using this button */}
            <button
                onClick={handleUsage}
                disabled={isDisabled}
                className={getButtonStyle()}
                title={userVote === 'up' ? `Remove usage mark (${upvotes} users)` : `Mark as using (${upvotes} users)`}
            >
                {/* 显示图标状态：根据userVote状态立即显示对应图标 */}
                {userVote === 'up' ? (
                    <ThumbsUp 
                        className={config.icon}
                        fill="currentColor"
                        strokeWidth={0}
                    />
                ) : (
                    <ThumbsUp 
                        className={config.icon}
                        fill="none"
                        strokeWidth={2}
                    />
                )}
            </button>

            {/* User count display */}
            {showScore && (
                <div className={getScoreStyle()}>
                    {upvotes} users
                </div>
            )}
        </div>
    );
};

// Main VoteButtons component that chooses between SSR and client versions
const VoteButtons: React.FC<VoteButtonsProps> = (props) => {
    if (isServerSide()) {
        return <VoteButtonsSSR {...props} />;
    }
    return <VoteButtonsClient {...props} />;
};

export default VoteButtons;