import React, { useEffect } from "react";
import { ThumbsUp, LogIn } from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
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
 * "I'm using this" feature component
 * Features:
 * - Users can mark "I'm using" a server
 * - Thumbs up icon becomes solid when selected
 * - Can click solid thumbs up to remove mark
 * - Shows total user count
 * - Clean single button layout
 */

const VoteButtons: React.FC<VoteButtonsProps> = ({
    serverId,
    size = 'md',
    className = '',
    showScore = true
}) => {
    // Check if we're in a client environment to avoid SSR issues
    const isClient = typeof window !== 'undefined';
    const { isSignedIn } = isClient ? useUser() : { isSignedIn: false };
    const { openSignIn } = isClient ? useClerk() : { openSignIn: () => {} };
    
    // Try to get score from batch provider first, fallback to individual query
    const { score: batchScore, isLoading: batchLoading, hasBatchProvider } = useBatchScore(serverId);
    // Only fetch individual score if no batch provider exists
    const shouldFetchIndividual = !hasBatchProvider;
    const { data: individualScore, isLoading: individualScoreLoading } = useServerScore(serverId, shouldFetchIndividual);
    const serverScore = batchScore || individualScore;
    const scoreLoading = hasBatchProvider ? batchLoading : individualScoreLoading;
    
    // Get user vote status
    const { data: userVote, isLoading: voteLoading } = useUserVote(serverId);
    
    // Vote operations
    const { vote, removeVote, isVoting, lastVoteResult } = useVoteMutation(serverId);

    // Listen to vote results, provide feedback
    useEffect(() => {
        if (lastVoteResult) {
            if (lastVoteResult.rateLimited) {
                notify('Rate limited! Please wait before voting again.', 'error');
            } else if (lastVoteResult.success) {
                const voteType = lastVoteResult.userVote;
                if (voteType) {
                    notify('Marked as using!');
                } else {
                    notify('Usage mark removed');
                }
            }
        }
    }, [lastVoteResult]);

    // Handle "I'm using this" marking
    const handleUsage = async () => {
        if (!isSignedIn) {
            openSignIn();
            return;
        }

        try {
            if (userVote === 'up') {
                // If already marked as using, remove the mark
                removeVote();
                notify('Usage mark removed');
            } else {
                // Otherwise mark as using
                vote('up');
            }
        } catch {
            notify('Operation failed, please try again', 'error');
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
    const isLoading = scoreLoading || voteLoading || isVoting;

    // Button style
    const getButtonStyle = () => {
        const roundedStyle = showScore ? 'rounded-full' : 'rounded-lg';
        const baseStyle = `flex items-center justify-center ${roundedStyle} transition-all duration-150 ${config.button}`;
        const isSelected = userVote === 'up';
        const isDisabled = isLoading || !isSignedIn;

        if (isDisabled) {
            return `${baseStyle} text-gray-300 cursor-not-allowed dark:text-gray-600`;
        }

        if (!showScore) {
            return isSelected
                ? `${baseStyle} text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30`
                : `${baseStyle} text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700`;
        }

        return isSelected
            ? `${baseStyle} text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20`
            : `${baseStyle} text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20`;
    };

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

    // Login prompt
    if (!isSignedIn) {
        const buttonClass = showScore ? 'w-6 h-6' : 'w-8 h-8';
        const iconClass = showScore ? 'h-3 w-3' : 'h-4 w-4';
        const buttonStyle = showScore 
            ? `flex items-center justify-center ${buttonClass} bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition-all duration-150 dark:bg-red-900/20 dark:text-red-400`
            : `flex items-center justify-center ${buttonClass} bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-150 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700`;
        
        return (
            <div className={`flex items-center ${config.container} ${className}`}>
                <button
                    onClick={() => openSignIn()}
                    className={buttonStyle}
                    title={`Sign in to mark as using (${serverScore?.upvotes || 0} users)`}
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
    }

    return (
        <div className={`flex items-center ${config.container} ${className}`}>
            {/* I'm using this button */}
            <button
                onClick={handleUsage}
                disabled={isLoading}
                className={getButtonStyle()}
                title={userVote === 'up' ? `Remove usage mark (${serverScore?.upvotes || 0} users)` : `Mark as using (${serverScore?.upvotes || 0} users)`}
            >
                <ThumbsUp 
                    className={config.icon} 
                    fill={userVote === 'up' ? 'currentColor' : 'none'} 
                />
            </button>

            {/* User count display */}
            {showScore && serverScore && (
                <div className={getScoreStyle()}>
                    {serverScore.upvotes || 0} users
                </div>
            )}
        </div>
    );
};

// Compact usage button (small size)
export const CompactVoteButtons: React.FC<Omit<VoteButtonsProps, 'size'>> = (props) => {
    return <VoteButtons {...props} size="sm" />;
};

// Detailed usage button (with usage details)
export const DetailedVoteButtons: React.FC<VoteButtonsProps & { 
    showDetails?: boolean;
}> = ({ showDetails = false, ...props }) => {
    // Use batch score hook to be consistent
    const { score: batchScore, hasBatchProvider } = useBatchScore(props.serverId);
    const { data: individualScore } = useServerScore(props.serverId, !hasBatchProvider);
    const serverScore = batchScore || individualScore;
    
    if (!showDetails) {
        return <VoteButtons {...props} />;
    }

    return (
        <div className="space-y-2">
            <VoteButtons {...props} />
            {serverScore && (
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <div>👍 {serverScore.upvotes} users</div>
                    <div>Base score: {serverScore.initial_score}</div>
                    <div>User score: {serverScore.vote_score > 0 ? '+' : ''}{serverScore.vote_score}</div>
                    {serverScore.is_monorepo && (
                        <div className="text-yellow-600 dark:text-yellow-400">
                            📦 Monorepo
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VoteButtons;