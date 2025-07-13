import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface VotingState {
    userVote: 'up' | 'down' | null;
    upvotes: number;
    isVoting: boolean;
}

interface VotingResult {
    userVote: 'up' | 'down' | null;
    upvotes: number;
    downvotes: number;
}

/**
 * 乐观投票hook - 立即响应用户操作
 */
export function useOptimisticVoting(serverId: string, initialData?: {
    userVote?: 'up' | 'down' | null;
    upvotes?: number;
}) {
    const { user } = useUser();
    const queryClient = useQueryClient();
    
    // 本地状态管理 - 使用函数形式初始化，避免每次渲染都创建新对象
    const [state, setState] = useState<VotingState>(() => ({
        userVote: initialData?.userVote || null,
        upvotes: initialData?.upvotes || 0,
        isVoting: false
    }));

    // 同步初始数据变化
    useEffect(() => {
        setState(prev => ({
            ...prev,
            userVote: initialData?.userVote || null,
            upvotes: initialData?.upvotes || 0
        }));
    }, [initialData?.userVote, initialData?.upvotes]);

    // 处理投票逻辑 - 直接操作数据库表而不是存储过程
    const handleVote = async (voteType: 'up' | 'down'): Promise<VotingResult> => {
        if (!user) throw new Error('User not authenticated');
        
        try {
            // 检查现有投票
            const { data: existingVote } = await supabase
                .from('server_votes')
                .select('vote_type')
                .eq('user_id', user.id)
                .eq('server_id', serverId)
                .single();

            let finalVoteType: 'up' | 'down' | null = voteType;

            if (existingVote) {
                if (existingVote.vote_type === voteType) {
                    // 相同投票，删除投票
                    const { error: deleteError } = await supabase
                        .from('server_votes')
                        .delete()
                        .eq('user_id', user.id)
                        .eq('server_id', serverId);

                    if (deleteError) throw deleteError;
                    finalVoteType = null;
                } else {
                    // 不同投票，更新投票
                    const { error: updateError } = await supabase
                        .from('server_votes')
                        .update({ 
                            vote_type: voteType,
                            updated_at: new Date().toISOString()
                        })
                        .eq('user_id', user.id)
                        .eq('server_id', serverId);

                    if (updateError) throw updateError;
                }
            } else {
                // 新投票
                const { error: insertError } = await supabase
                    .from('server_votes')
                    .insert({
                        user_id: user.id,
                        server_id: serverId,
                        vote_type: voteType
                    });

                if (insertError) throw insertError;
            }

            // 获取更新后的分数
            const { data: scoreData, error: scoreError } = await supabase
                .from('server_scores')
                .select('upvotes, downvotes')
                .eq('server_id', serverId)
                .single();

            if (scoreError) {
                console.warn('Failed to get updated score:', scoreError);
                // 如果无法获取分数，返回估算值
                const currentUpvotes = state.upvotes;
                let estimatedUpvotes = currentUpvotes;
                
                if (state.userVote === 'up' && finalVoteType !== 'up') {
                    estimatedUpvotes = Math.max(0, currentUpvotes - 1);
                } else if (state.userVote !== 'up' && finalVoteType === 'up') {
                    estimatedUpvotes = currentUpvotes + 1;
                }

                return {
                    userVote: finalVoteType,
                    upvotes: estimatedUpvotes,
                    downvotes: 0
                };
            }

            return {
                userVote: finalVoteType,
                upvotes: scoreData?.upvotes || 0,
                downvotes: scoreData?.downvotes || 0
            };
        } catch (error) {
            console.error('Vote operation failed:', error);
            throw error;
        }
    };

    // 投票mutation
    const voteMutation = useMutation({
        mutationFn: handleVote,
        onMutate: async (voteType: 'up' | 'down') => {
            // 立即更新本地状态
            setState(prev => {
                const currentVote = prev.userVote;
                const finalVote = currentVote === voteType ? null : voteType;
                
                let newUpvotes = prev.upvotes;
                
                // 撤销之前的投票
                if (currentVote === 'up') {
                    newUpvotes = Math.max(0, newUpvotes - 1);
                }
                
                // 添加新投票
                if (finalVote === 'up') {
                    newUpvotes += 1;
                }
                
                return {
                    ...prev,
                    userVote: finalVote,  // 立即更新userVote状态
                    upvotes: newUpvotes,
                    isVoting: true        // 设置加载状态但不影响图标显示
                };
            });
            
            return { previousState: state };
        },
        onError: (error, voteType, context) => {
            // 回滚本地状态
            if (context?.previousState) {
                setState(context.previousState);
            }
            console.error('Vote failed:', error);
        },
        onSuccess: (result) => {
            // 使用服务器返回的真实数据更新状态
            setState(prev => ({
                ...prev,
                userVote: result.userVote,
                upvotes: result.upvotes,
                isVoting: false
            }));
            
            // 更新React Query缓存
            updateCaches(result);
        },
        onSettled: () => {
            // 确保loading状态被清除
            setState(prev => ({ ...prev, isVoting: false }));
        }
    });

    // 更新React Query缓存
    const updateCaches = useCallback((result: VotingResult) => {
        if (!user) return;
        
        // 更新用户投票缓存
        const userVoteQueries = queryClient.getQueryCache().getAll().filter(query => {
            const key = query.queryKey;
            if (key[0] === 'batch-user-votes' && key[1] === user.id && key[2]) {
                const serverIds = (key[2] as string).split(',');
                return serverIds.includes(serverId);
            }
            return false;
        });

        userVoteQueries.forEach(query => {
            const currentData = queryClient.getQueryData(query.queryKey) as Record<string, 'up' | 'down'> || {};
            const newData = { ...currentData };
            
            if (result.userVote) {
                newData[serverId] = result.userVote;
            } else {
                delete newData[serverId];
            }
            
            queryClient.setQueryData(query.queryKey, newData);
        });

        // 更新分数缓存
        const scoreQueries = queryClient.getQueryCache().getAll().filter(query => {
            const key = query.queryKey;
            return key[0] === 'server-scores' || (key[0] === 'server-score' && key[1] === serverId);
        });

        scoreQueries.forEach(query => {
            const key = query.queryKey;
            if (key[0] === 'server-score') {
                queryClient.setQueryData(key, {
                    upvotes: result.upvotes,
                    downvotes: result.downvotes,
                    total_votes: result.upvotes + result.downvotes
                });
            } else if (key[0] === 'server-scores') {
                const currentData = queryClient.getQueryData(key) as Record<string, unknown> || {};
                queryClient.setQueryData(key, {
                    ...currentData,
                    [serverId]: {
                        ...currentData[serverId],
                        upvotes: result.upvotes,
                        downvotes: result.downvotes,
                        total_votes: result.upvotes + result.downvotes
                    }
                });
            }
        });
    }, [user, serverId, queryClient]);

    // 投票函数
    const vote = useCallback((voteType: 'up' | 'down') => {
        if (!user || state.isVoting) return;
        voteMutation.mutate(voteType);
    }, [user, state.isVoting, voteMutation]);

    return {
        userVote: state.userVote,
        upvotes: state.upvotes,
        isVoting: state.isVoting,
        vote,
        canVote: !!user && !state.isVoting
    };
}