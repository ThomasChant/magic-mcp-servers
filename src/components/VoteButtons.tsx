import React, { useEffect } from "react";
import { ThumbsUp, LogIn } from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useServerScore, useUserVote, useVoteMutation } from "../services/voting";

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
    const { isSignedIn } = useUser();
    const { openSignIn } = useClerk();
    
    // Get server score and user vote status
    const { data: serverScore, isLoading: scoreLoading } = useServerScore(serverId);
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
            button: 'w-6 h-6',
            icon: 'h-3 w-3',
            score: 'text-xs font-medium px-1 min-w-[1.5rem]',
            container: 'gap-1'
        },
        md: {
            button: 'w-8 h-8',
            icon: 'h-4 w-4',
            score: 'text-sm font-medium px-1 min-w-[2rem]',
            container: 'gap-1'
        },
        lg: {
            button: 'w-10 h-10',
            icon: 'h-5 w-5',
            score: 'text-base font-medium px-1 min-w-[2.5rem]',
            container: 'gap-1'
        }
    };

    const config = sizeConfig[size];
    const isLoading = scoreLoading || voteLoading || isVoting;

    // Button style
    const getButtonStyle = () => {
        const baseStyle = `flex items-center justify-center rounded-full transition-all duration-150 ${config.button}`;
        const isSelected = userVote === 'up';
        const isDisabled = isLoading || !isSignedIn;

        if (isDisabled) {
            return `${baseStyle} text-gray-300 cursor-not-allowed dark:text-gray-600`;
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
        return (
            <div className={`flex items-center ${config.container} ${className}`}>
                <button
                    onClick={() => openSignIn()}
                    className={`flex items-center justify-center ${config.button} bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition-all duration-150 dark:bg-red-900/20 dark:text-red-400`}
                    title="Sign in to mark as using"
                >
                    <LogIn className={config.icon} />
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
                title={userVote === 'up' ? 'Remove usage mark' : 'Mark as using'}
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
    const { data: serverScore } = useServerScore(props.serverId);
    
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