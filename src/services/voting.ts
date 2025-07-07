import { supabase } from "../lib/supabase";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * @interface ServerVote
 * @description Server vote record structure
 */
export interface ServerVote {
    id: string;
    user_id: string;
    server_id: string;
    vote_type: 'up' | 'down';
    created_at: string;
    updated_at: string;
}

/**
 * @interface ServerScore
 * @description Server score information
 */
export interface ServerScore {
    server_id: string;
    name: string;
    github_url: string;
    stars: number;
    is_monorepo: boolean;
    initial_score: number;
    upvotes: number;
    downvotes: number;
    vote_score: number;
    total_score: number;
    total_votes: number;
    last_vote_at?: string;
}

/**
 * @interface VoteResult
 * @description Vote operation result
 */
export interface VoteResult {
    success: boolean;
    newScore: ServerScore;
    userVote: 'up' | 'down' | null;
    rateLimited?: boolean;
    cooldownRemaining?: number;
}

/**
 * @class VotingService
 * @description Voting service implementation
 */
export class VotingService {
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    /**
     * Cast or update a vote
     */
    async vote(serverId: string, voteType: 'up' | 'down'): Promise<VoteResult> {
        try {
            // 首先检查速率限制和冷却时间
            const { data: canVoteData, error: canVoteError } = await supabase
                .rpc('can_user_vote', { user_id_param: this.userId });

            if (canVoteError) {
                throw new Error(`Failed to check rate limit: ${canVoteError.message}`);
            }

            if (!canVoteData) {
                const score = await this.getServerScore(serverId);
                return {
                    success: false,
                    newScore: score,
                    userVote: null,
                    rateLimited: true,
                    cooldownRemaining: 10 // 默认冷却时间
                };
            }

            // 检查用户是否已经投过票
            const { data: existingVote } = await supabase
                .from('server_votes')
                .select('*')
                .eq('user_id', this.userId)
                .eq('server_id', serverId)
                .single();

            if (existingVote) {
                // 如果投的是同样的票，不做任何操作
                if (existingVote.vote_type === voteType) {
                    const score = await this.getServerScore(serverId);
                    return {
                        success: true,
                        newScore: score,
                        userVote: voteType
                    };
                }
                
                // 更新投票
                const { error } = await supabase
                    .from('server_votes')
                    .update({ 
                        vote_type: voteType,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', this.userId)
                    .eq('server_id', serverId);

                if (error) {
                    throw new Error(`Failed to update vote: ${error.message}`);
                }
            } else {
                // 创建新投票
                const { error } = await supabase
                    .from('server_votes')
                    .insert({
                        user_id: this.userId,
                        server_id: serverId,
                        vote_type: voteType
                    });

                if (error) {
                    throw new Error(`Failed to create vote: ${error.message}`);
                }
            }

            // 记录投票行为（更新速率限制计数器）
            const { error: recordError } = await supabase
                .rpc('record_vote_action', { user_id_param: this.userId });

            if (recordError) {
                console.warn('Failed to record vote action:', recordError.message);
                // 不抛出错误，因为投票已经成功，只是速率限制记录失败
            }

            // 获取更新后的分数
            const newScore = await this.getServerScore(serverId);
            
            return {
                success: true,
                newScore,
                userVote: voteType
            };
        } catch (error) {
            console.error('Failed to vote:', error);
            throw error;
        }
    }

    /**
     * Remove a vote
     */
    async removeVote(serverId: string): Promise<VoteResult> {
        try {
            const { error } = await supabase
                .from('server_votes')
                .delete()
                .eq('user_id', this.userId)
                .eq('server_id', serverId);

            if (error) {
                throw new Error(`Failed to remove vote: ${error.message}`);
            }

            // 获取更新后的分数
            const newScore = await this.getServerScore(serverId);
            
            return {
                success: true,
                newScore,
                userVote: null
            };
        } catch (error) {
            console.error('Failed to remove vote:', error);
            throw error;
        }
    }

    /**
     * Get user's vote for a specific server
     */
    async getUserVote(serverId: string): Promise<'up' | 'down' | null> {
        try {
            const { data, error } = await supabase
                .from('server_votes')
                .select('vote_type')
                .eq('user_id', this.userId)
                .eq('server_id', serverId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw new Error(`Failed to get user vote: ${error.message}`);
            }

            return data?.vote_type || null;
        } catch (error) {
            console.error('Failed to get user vote:', error);
            return null;
        }
    }

    /**
     * Get server score information
     */
    async getServerScore(serverId: string): Promise<ServerScore> {
        try {
            const { data, error } = await supabase
                .from('server_scores')
                .select('*')
                .eq('server_id', serverId)
                .single();

            if (error) {
                throw new Error(`Failed to get server score: ${error.message}`);
            }

            if (!data) {
                throw new Error('Server not found');
            }

            return data as ServerScore;
        } catch (error) {
            console.error('Failed to get server score:', error);
            throw error;
        }
    }

    /**
     * Get multiple server scores
     */
    async getServerScores(serverIds: string[]): Promise<Record<string, ServerScore>> {
        try {
            const { data, error } = await supabase
                .from('server_scores')
                .select('*')
                .in('server_id', serverIds);

            if (error) {
                throw new Error(`Failed to get server scores: ${error.message}`);
            }

            const scores: Record<string, ServerScore> = {};
            data?.forEach(score => {
                scores[score.server_id] = score as ServerScore;
            });

            return scores;
        } catch (error) {
            console.error('Failed to get server scores:', error);
            return {};
        }
    }

    /**
     * Get user votes for multiple servers
     */
    async getUserVotes(serverIds: string[]): Promise<Record<string, 'up' | 'down'>> {
        try {
            const { data, error } = await supabase
                .from('server_votes')
                .select('server_id, vote_type')
                .eq('user_id', this.userId)
                .in('server_id', serverIds);

            if (error) {
                throw new Error(`Failed to get user votes: ${error.message}`);
            }

            const votes: Record<string, 'up' | 'down'> = {};
            data?.forEach(vote => {
                votes[vote.server_id] = vote.vote_type as 'up' | 'down';
            });

            return votes;
        } catch (error) {
            console.error('Failed to get user votes:', error);
            return {};
        }
    }
}

/**
 * @function createVotingService
 * @description Factory function to create voting service
 */
export function createVotingService(userId: string): VotingService {
    return new VotingService(userId);
}

/**
 * @hook useVotingService
 * @description Hook to get voting service instance
 */
export function useVotingService(): VotingService | null {
    const { user } = useUser();
    
    if (!user) {
        return null;
    }
    
    return createVotingService(user.id);
}

/**
 * @hook useServerScore
 * @description Hook to get server score
 */
export function useServerScore(serverId: string, enabled: boolean = true) {
    return useQuery({
        queryKey: ['server-score', serverId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('server_scores')
                .select('*')
                .eq('server_id', serverId)
                .single();

            if (error) {
                throw new Error(`Failed to get server score: ${error.message}`);
            }

            return data as ServerScore;
        },
        enabled: !!serverId && enabled,
        staleTime: 1 * 60 * 1000, // 1 minute
    });
}

/**
 * @hook useServerScores
 * @description Hook to get multiple server scores
 */
export function useServerScores(serverIds: string[]) {
    return useQuery({
        queryKey: ['server-scores', serverIds],
        queryFn: async () => {
            if (serverIds.length === 0) return {};

            const { data, error } = await supabase
                .from('server_scores')
                .select('*')
                .in('server_id', serverIds);

            if (error) {
                throw new Error(`Failed to get server scores: ${error.message}`);
            }

            const scores: Record<string, ServerScore> = {};
            data?.forEach(score => {
                scores[score.server_id] = score as ServerScore;
            });

            return scores;
        },
        enabled: serverIds.length > 0,
        staleTime: 1 * 60 * 1000, // 1 minute
    });
}

/**
 * @hook useUserVote
 * @description Hook to get user's vote for a server
 */
export function useUserVote(serverId: string, enabled: boolean = true) {
    const { user } = useUser();
    
    return useQuery({
        queryKey: ['user-vote', user?.id, serverId],
        queryFn: async () => {
            if (!user) return null;

            const { data, error } = await supabase
                .from('server_votes')
                .select('vote_type')
                .eq('user_id', user.id)
                .eq('server_id', serverId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new Error(`Failed to get user vote: ${error.message}`);
            }

            return data?.vote_type as 'up' | 'down' | null || null;
        },
        enabled: !!user && !!serverId && enabled,
        staleTime: 30 * 1000, // 30 seconds
    });
}

/**
 * @hook useVoteMutation
 * @description Hook to handle voting mutations
 */
export function useVoteMutation(serverId: string) {
    const queryClient = useQueryClient();
    const votingService = useVotingService();
    const { user } = useUser();

    const voteMutation = useMutation({
        mutationFn: async (voteType: 'up' | 'down') => {
            if (!votingService) {
                throw new Error('User not authenticated');
            }
            return votingService.vote(serverId, voteType);
        },
        onSuccess: (result) => {
            // 检查是否被速率限制
            if (result.rateLimited) {
                console.warn('Vote was rate limited');
                return; // 不更新缓存，因为投票失败
            }

            // 更新相关缓存
            queryClient.setQueryData(['server-score', serverId], result.newScore);
            queryClient.setQueryData(['user-vote', user?.id, serverId], result.userVote);
            
            // 使相关查询失效以触发重新获取
            queryClient.invalidateQueries({ queryKey: ['server-scores'] });
            queryClient.invalidateQueries({ queryKey: ['servers'] });
        },
        onError: (error) => {
            console.error('Vote mutation error:', error);
        }
    });

    const removeVoteMutation = useMutation({
        mutationFn: async () => {
            if (!votingService) {
                throw new Error('User not authenticated');
            }
            return votingService.removeVote(serverId);
        },
        onSuccess: (result) => {
            // 更新相关缓存
            queryClient.setQueryData(['server-score', serverId], result.newScore);
            queryClient.setQueryData(['user-vote', user?.id, serverId], result.userVote);
            
            // 使相关查询失效以触发重新获取
            queryClient.invalidateQueries({ queryKey: ['server-scores'] });
            queryClient.invalidateQueries({ queryKey: ['servers'] });
        },
    });

    return {
        vote: voteMutation.mutate,
        removeVote: removeVoteMutation.mutate,
        isVoting: voteMutation.isPending,
        isRemoving: removeVoteMutation.isPending,
        error: voteMutation.error || removeVoteMutation.error,
        lastVoteResult: voteMutation.data,
    };
}