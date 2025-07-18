import React, { createContext, useContext, useMemo } from 'react';
import { useServerScores } from '../services/voting';
import type { ServerScore } from '../services/voting';

interface BatchScoreContextValue {
    scores: Record<string, ServerScore>;
    isLoading: boolean;
}

const BatchScoreContext = createContext<BatchScoreContextValue | null>(null);

export function useBatchScore(serverId: string): {
    score: ServerScore | undefined;
    isLoading: boolean;
    hasBatchProvider: boolean;
} {
    const context = useContext(BatchScoreContext);
    if (!context) {
        return {
            score: undefined,
            isLoading: false,
            hasBatchProvider: false
        };
    }
    return {
        score: context.scores[serverId],
        isLoading: context.isLoading,
        hasBatchProvider: true
    };
}

interface BatchScoreProviderProps {
    serverIds: string[];
    children: React.ReactNode;
}

export const BatchScoreProvider: React.FC<BatchScoreProviderProps> = ({ serverIds, children }) => {
    // Fetch all scores in one batch query
    const { data: scores = {}, isLoading } = useServerScores(serverIds);
    
    const contextValue = useMemo(() => ({
        scores,
        isLoading
    }), [scores, isLoading]);
    
    return (
        <BatchScoreContext.Provider value={contextValue}>
            {children}
        </BatchScoreContext.Provider>
    );
};