import React, { useEffect } from "react";
import { ThumbsUp, LogIn } from "lucide-react";
import { useServerScore, useUserVote, useVoteMutation } from "../services/voting";
import { useBatchScore } from "./BatchScoreProvider";

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
 * Safe VoteButtons component that doesn't depend on Clerk
 * Shows login prompt instead of functional voting when not authenticated
 */
const VoteButtonsSafe: React.FC<VoteButtonsProps> = ({
    serverId,
    size = 'md',
    className = '',
    showScore = true
}) => {
    // Try to get score from batch provider first, fallback to individual query
    const { score: batchScore, isLoading: batchLoading, hasBatchProvider } = useBatchScore(serverId);
    // Only fetch individual score if no batch provider exists
    const shouldFetchIndividual = !hasBatchProvider;
    const { data: individualScore, isLoading: individualScoreLoading } = useServerScore(serverId, shouldFetchIndividual);
    const serverScore = batchScore || individualScore;
    const scoreLoading = hasBatchProvider ? batchLoading : individualScoreLoading;

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
    const isLoading = scoreLoading;

    // User count style
    const getScoreStyle = () => {
        const baseStyle = `text-center flex items-center justify-center ${config.score}`;
        const upvotes = serverScore?.upvotes || 0;

        if (upvotes > 0) {
            return `${baseStyle} text-red-600 dark:text-red-400`;
        } else {
            return `${baseStyle} text-gray-600 dark:text-gray-400`;
        }
    };

    // Show login prompt (non-functional for safety)
    const buttonClass = showScore ? 'w-6 h-6' : 'w-8 h-8';
    const iconClass = showScore ? 'h-3 w-3' : 'h-4 w-4';
    const buttonStyle = showScore 
        ? `flex items-center justify-center ${buttonClass} bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition-all duration-150 dark:bg-red-900/20 dark:text-red-400`
        : `flex items-center justify-center ${buttonClass} bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-150 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700`;
    
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <button
                onClick={() => {
                    // Safe no-op - could show a message or redirect to sign up
                    notify('Please sign in to vote', 'error');
                }}
                className={buttonStyle}
                title={`Sign in to vote (${serverScore?.upvotes || 0} users)`}
                disabled={isLoading}
            >
                <LogIn className={iconClass} />
            </button>
            {showScore && serverScore && (
                <div className={getScoreStyle()}>
                    {serverScore.upvotes || 0} users
                </div>
            )}
        </div>
    );
};

export default VoteButtonsSafe;