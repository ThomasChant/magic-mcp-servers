import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import { isServerSide } from '../utils/environment';

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
    
    // Debug logging
    console.log(`useBatchUserVote Debug - ServerID: ${serverId}, HasContext: ${!!context}, Context: ${context ? Object.keys(context.userVotes).length + ' votes' : 'null'}`);
    
    if (!context) {
        console.log(`useBatchUserVote - No context for ${serverId}, returning defaults`);
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

// SSR-safe BatchUserVoteProvider
const BatchUserVoteProviderSSR: React.FC<BatchUserVoteProviderProps> = ({ children }) => {
    const contextValue = {
        userVotes: {},
        isLoading: false
    };
    
    return (
        <BatchUserVoteContext.Provider value={contextValue}>
            {children}
        </BatchUserVoteContext.Provider>
    );
};

// Client-side BatchUserVoteProvider
const BatchUserVoteProviderClient: React.FC<BatchUserVoteProviderProps> = ({ serverIds, children }) => {
    // Client-side only: use Clerk hook
    const { user } = useUser();
    
    // Debug logging
    console.log(`BatchUserVoteProvider Debug - ServerIDs: [${serverIds.join(', ')}], User: ${user?.id || 'none'}`);
    
    // Fetch all user votes in one batch query
    const { data: userVotes = {}, isLoading } = useQuery({
        queryKey: ['batch-user-votes', user?.id, serverIds.sort().join(',')],
        queryFn: async () => {
            // Return empty object if no user (SSR) or no serverIds
            if (!user || serverIds.length === 0) {
                console.log('BatchUserVoteProvider: No user or serverIds, returning empty votes');
                return {};
            }

            console.log(`BatchUserVoteProvider: Executing batch query for user ${user.id}, servers: [${serverIds.join(', ')}]`);
            
            const { data, error } = await supabase
                .from('server_votes')
                .select('server_id, vote_type')
                .eq('user_id', user.id)
                .in('server_id', serverIds);

            if (error) {
                console.error('BatchUserVoteProvider: Query failed:', error.message);
                throw new Error(`Failed to get user votes: ${error.message}`);
            }

            console.log('BatchUserVoteProvider: Query successful, votes:', data?.length || 0);

            const votes: Record<string, 'up' | 'down'> = {};
            data?.forEach(vote => {
                votes[vote.server_id] = vote.vote_type as 'up' | 'down';
            });

            return votes;
        },
        enabled: serverIds.length > 0, // Remove user dependency for SSR compatibility
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

// Main BatchUserVoteProvider that chooses between SSR and client versions
export const BatchUserVoteProvider: React.FC<BatchUserVoteProviderProps> = (props) => {
    if (isServerSide()) {
        return <BatchUserVoteProviderSSR {...props} />;
    }
    return <BatchUserVoteProviderClient {...props} />;
};