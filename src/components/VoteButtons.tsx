import React, { useEffect } from "react";
import { Triangle, LogIn } from "lucide-react";
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
 * Reddit风格投票组件
 * 特点：
 * - 选中后箭头变为实心
 * - 可以点击实心箭头取消投票
 * - 也可以点击相反箭头来改变投票
 * - 水平紧凑布局：上箭头 + 分数 + 下箭头
 */

const VoteButtons: React.FC<VoteButtonsProps> = ({
    serverId,
    size = 'md',
    className = '',
    showScore = true
}) => {
    const { isSignedIn } = useUser();
    const { openSignIn } = useClerk();
    
    // 获取服务器分数和用户投票状态
    const { data: serverScore, isLoading: scoreLoading } = useServerScore(serverId);
    const { data: userVote, isLoading: voteLoading } = useUserVote(serverId);
    
    // 投票操作
    const { vote, removeVote, isVoting, lastVoteResult } = useVoteMutation(serverId);

    // 监听投票结果，提供反馈
    useEffect(() => {
        if (lastVoteResult) {
            if (lastVoteResult.rateLimited) {
                notify('Rate limited! Please wait before voting again.', 'error');
            } else if (lastVoteResult.success) {
                const voteType = lastVoteResult.userVote;
                if (voteType) {
                    notify(voteType === 'up' ? 'Upvoted!' : 'Downvoted!');
                } else {
                    notify('Vote removed');
                }
            }
        }
    }, [lastVoteResult]);

    // 处理投票 - 可以点击相同箭头取消
    const handleVote = async (voteType: 'up' | 'down') => {
        if (!isSignedIn) {
            openSignIn();
            return;
        }

        try {
            if (userVote === voteType) {
                // 如果点击的是已选择的投票，则取消投票
                removeVote();
                notify('Vote removed');
            } else {
                // 否则投票或更改投票（反馈由useEffect处理）
                vote(voteType);
            }
        } catch {
            notify('Failed to vote. Please try again.', 'error');
        }
    };

    // Reddit风格样式配置 - 水平排列紧凑
    const sizeConfig = {
        sm: {
            button: 'w-6 h-6',
            icon: 'h-3 w-3',
            score: 'text-xs font-medium px-0.5 min-w-[1.25rem]',
            container: 'gap-0'
        },
        md: {
            button: 'w-8 h-8',
            icon: 'h-4 w-4',
            score: 'text-sm font-bold px-0.5 min-w-[1.75rem]',
            container: 'gap-0'
        },
        lg: {
            button: 'w-10 h-10',
            icon: 'h-5 w-5',
            score: 'text-base font-bold px-1 min-w-[2rem]',
            container: 'gap-0'
        }
    };

    const config = sizeConfig[size];
    const isLoading = scoreLoading || voteLoading || isVoting;

    // Reddit风格按钮样式
    const getButtonStyle = (voteType: 'up' | 'down') => {
        const baseStyle = `flex items-center justify-center rounded-sm transition-all duration-150 ${config.button}`;
        const isSelected = userVote === voteType;
        const isDisabled = isLoading || !isSignedIn;

        if (isDisabled) {
            return `${baseStyle} text-gray-300 cursor-not-allowed dark:text-gray-600`;
        }

        if (voteType === 'up') {
            return isSelected
                ? `${baseStyle} text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20`
                : `${baseStyle} text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:text-gray-500 dark:hover:text-orange-400 dark:hover:bg-orange-900/20`;
        } else {
            return isSelected
                ? `${baseStyle} text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20`
                : `${baseStyle} text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:text-gray-500 dark:hover:text-purple-400 dark:hover:bg-purple-900/20`;
        }
    };

    // 分数样式 - 水平布局优化
    const getScoreStyle = () => {
        const baseStyle = `text-center flex items-center justify-center ${config.score}`;
        const score = serverScore?.total_score || 0;

        if (score > 0) {
            return `${baseStyle} text-orange-600 dark:text-orange-400`;
        } else if (score < 0) {
            return `${baseStyle} text-purple-600 dark:text-purple-400`;
        } else {
            return `${baseStyle} text-gray-600 dark:text-gray-400`;
        }
    };

    // 登录提示
    if (!isSignedIn) {
        return (
            <div className={`flex items-center ${config.container} ${className}`}>
                <button
                    onClick={() => openSignIn()}
                    className={`flex items-center justify-center ${config.button} bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-sm transition-all duration-150 dark:bg-blue-900/20 dark:text-blue-400`}
                    title="Sign in to vote"
                >
                    <LogIn className={config.icon} />
                </button>
                {showScore && serverScore && (
                    <div className={getScoreStyle()}>
                        {serverScore.total_score > 0 ? '+' : ''}{serverScore.total_score}
                    </div>
                )}
                <div className={`${config.button} flex items-center justify-center`}>
                    <Triangle className={`${config.icon} rotate-180 text-gray-300 dark:text-gray-600`} fill="none" />
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center ${config.container} ${className}`}>
            {/* Upvote Button - Reddit风格上箭头 */}
            <button
                onClick={() => handleVote('up')}
                disabled={isLoading}
                className={getButtonStyle('up')}
                title={userVote === 'up' ? 'Remove upvote' : 'Upvote'}
            >
                <Triangle 
                    className={config.icon} 
                    fill={userVote === 'up' ? 'currentColor' : 'none'} 
                />
            </button>

            {/* Score Display - Reddit风格分数 */}
            {showScore && serverScore && (
                <div className={getScoreStyle()}>
                    {serverScore.total_score > 0 ? '+' : ''}{serverScore.total_score}
                </div>
            )}

            {/* Downvote Button - Reddit风格下箭头 */}
            <button
                onClick={() => handleVote('down')}
                disabled={isLoading}
                className={getButtonStyle('down')}
                title={userVote === 'down' ? 'Remove downvote' : 'Downvote'}
            >
                <Triangle 
                    className={`${config.icon} rotate-180`} 
                    fill={userVote === 'down' ? 'currentColor' : 'none'} 
                />
            </button>
        </div>
    );
};

// 紧凑版投票组件（小尺寸）
export const CompactVoteButtons: React.FC<Omit<VoteButtonsProps, 'size'>> = (props) => {
    return <VoteButtons {...props} size="sm" />;
};

// 详细版投票组件（带投票详情）
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
                    <div>↑ {serverScore.upvotes} · ↓ {serverScore.downvotes}</div>
                    <div>Initial: {serverScore.initial_score}</div>
                    <div>Votes: {serverScore.vote_score > 0 ? '+' : ''}{serverScore.vote_score}</div>
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