import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

interface BatchUserVoteContextValue {
    userVotes: Record<string, 'up' | 'down'>;
    isLoading: boolean;
}

const BatchUserVoteContext = createContext<BatchUserVoteContextValue | null>(null);

export function useBatchUserVote(serverId: string): {
    userVote: 'up' | 'down' | null;
    isLoading: boolean;
    hasBatchProvider: boolean;
} {
    const context = useContext(BatchUserVoteContext);
    if (!context) {
        return {
            userVote: null,
            isLoading: false,
            hasBatchProvider: false
        };
    }
    return {
        userVote: context.userVotes[serverId] || null,
        isLoading: context.isLoading,
        hasBatchProvider: true
    };
}

interface BatchUserVoteProviderProps {
    serverIds: string[];
    children: React.ReactNode;
}

export const BatchUserVoteProvider: React.FC<BatchUserVoteProviderProps> = ({ serverIds, children }) => {
    const { user } = useUser();
    
    // Fetch all user votes in one batch query
    const { data: userVotes = {}, isLoading } = useQuery({
        queryKey: ['user-votes', user?.id, serverIds],
        queryFn: async () => {
            if (!user || serverIds.length === 0) return {};

            const { data, error } = await supabase
                .from('server_votes')
                .select('server_id, vote_type')
                .eq('user_id', user.id)
                .in('server_id', serverIds);

            if (error) {
                throw new Error(`Failed to get user votes: ${error.message}`);
            }

            const votes: Record<string, 'up' | 'down'> = {};
            data?.forEach(vote => {
                votes[vote.server_id] = vote.vote_type as 'up' | 'down';
            });

            return votes;
        },
        enabled: !!user && serverIds.length > 0,
        staleTime: 30 * 1000, // 30 seconds
    });
    
    const contextValue = useMemo(() => ({
        userVotes,
        isLoading
    }), [userVotes, isLoading]);
    
    return (
        <BatchUserVoteContext.Provider value={contextValue}>
            {children}
        </BatchUserVoteContext.Provider>
    );
};