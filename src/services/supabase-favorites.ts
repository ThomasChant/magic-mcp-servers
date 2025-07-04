import { supabase } from "../lib/supabase";
import { useUser } from "@clerk/clerk-react";
import type { FavoritesService } from "./favorites";

/**
 * @interface UserFavorite
 * @description Supabase user_favorites table structure
 */
export interface UserFavorite {
    id: string;
    user_id: string;
    server_id: string;
    created_at: string;
    updated_at: string;
}

/**
 * @class SupabaseFavoritesService
 * @description Supabase-based favorites service implementation
 */
export class SupabaseFavoritesService implements FavoritesService {
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    /**
     * Get user's favorite servers
     */
    async getFavorites(): Promise<string[]> {
        try {
            const { data, error } = await supabase
                .from('user_favorites')
                .select('server_id')
                .eq('user_id', this.userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching favorites:', error);
                throw new Error(`Failed to fetch favorites: ${error.message}`);
            }

            return data?.map(fav => fav.server_id) || [];
        } catch (error) {
            console.error('Failed to get favorites:', error);
            throw error;
        }
    }

    /**
     * Add a server to favorites
     */
    async addToFavorites(serverId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('user_favorites')
                .insert({
                    user_id: this.userId,
                    server_id: serverId
                });

            if (error) {
                // Ignore duplicate key errors
                if (error.code === '23505') {
                    console.log('Server already in favorites');
                    return;
                }
                console.error('Error adding to favorites:', error);
                throw new Error(`Failed to add to favorites: ${error.message}`);
            }
        } catch (error) {
            console.error('Failed to add to favorites:', error);
            throw error;
        }
    }

    /**
     * Remove a server from favorites
     */
    async removeFromFavorites(serverId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('user_favorites')
                .delete()
                .eq('user_id', this.userId)
                .eq('server_id', serverId);

            if (error) {
                console.error('Error removing from favorites:', error);
                throw new Error(`Failed to remove from favorites: ${error.message}`);
            }
        } catch (error) {
            console.error('Failed to remove from favorites:', error);
            throw error;
        }
    }

    /**
     * Sync local favorites with Supabase
     */
    async syncWithLocal(localFavorites: string[]): Promise<string[]> {
        try {
            console.log(`[Sync] Starting sync for user ${this.userId}`);
            console.log('[Sync] Local favorites:', localFavorites);
            
            // Get current favorites from Supabase
            const cloudFavorites = await this.getFavorites();
            console.log('[Sync] Cloud favorites:', cloudFavorites);
            
            // Find favorites to add (in local but not in cloud)
            const toAdd = localFavorites.filter(id => !cloudFavorites.includes(id));
            console.log('[Sync] Favorites to add to cloud:', toAdd);
            
            // Create merged list (union of local and cloud)
            const mergedFavorites = [...new Set([...localFavorites, ...cloudFavorites])];
            console.log('[Sync] Merged favorites:', mergedFavorites);
            
            // Add missing favorites to cloud
            if (toAdd.length > 0) {
                const insertData = toAdd.map(server_id => ({
                    user_id: this.userId,
                    server_id
                }));
                
                const { error } = await supabase
                    .from('user_favorites')
                    .insert(insertData);
                
                if (error && error.code !== '23505') { // Ignore duplicate key errors
                    console.error('Error adding favorites during sync:', error);
                }
            }
            
            // Return the merged list (union of local and cloud)
            console.log('[Sync] Returning merged favorites:', mergedFavorites);
            return mergedFavorites;
        } catch (error) {
            console.error('Failed to sync favorites:', error);
            // On error, try to return cloud favorites if available
            try {
                const cloudFavorites = await this.getFavorites();
                console.log('[Sync] Fallback to cloud favorites:', cloudFavorites);
                return cloudFavorites.length > 0 ? cloudFavorites : localFavorites;
            } catch {
                // If cloud fetch also fails, return local as fallback
                console.log('[Sync] Fallback to local favorites:', localFavorites);
                return localFavorites;
            }
        }
    }

    /**
     * Clear all favorites
     */
    async clearFavorites(): Promise<void> {
        try {
            const { error } = await supabase
                .from('user_favorites')
                .delete()
                .eq('user_id', this.userId);

            if (error) {
                console.error('Error clearing favorites:', error);
                throw new Error(`Failed to clear favorites: ${error.message}`);
            }
        } catch (error) {
            console.error('Failed to clear favorites:', error);
            throw error;
        }
    }
}

/**
 * @function createSupabaseFavoritesService
 * @description Factory function to create Supabase favorites service
 */
export function createSupabaseFavoritesService(userId: string): FavoritesService {
    return new SupabaseFavoritesService(userId);
}

/**
 * @hook useSupabaseFavoritesService
 * @description Hook to get Supabase favorites service instance
 */
export function useSupabaseFavoritesService(): FavoritesService | null {
    const { user } = useUser();
    
    // Check if we're in a client environment to avoid SSR issues
    if (typeof window === 'undefined') {
        return null;
    }
    
    if (!user) {
        return null;
    }
    
    return createSupabaseFavoritesService(user.id);
}

/**
 * @hook usePublicFavoriteCounts
 * @description Hook to get public favorite counts for servers
 */
export function usePublicFavoriteCounts(serverIds?: string[]) {
    const getFavoriteCounts = async () => {
        try {
            let query = supabase
                .from('user_favorites')
                .select('server_id');

            if (serverIds && serverIds.length > 0) {
                query = query.in('server_id', serverIds);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching favorite counts:', error);
                return {};
            }

            // Count favorites per server
            const counts: Record<string, number> = {};
            data?.forEach(fav => {
                counts[fav.server_id] = (counts[fav.server_id] || 0) + 1;
            });

            return counts;
        } catch (error) {
            console.error('Failed to get favorite counts:', error);
            return {};
        }
    };

    return { getFavoriteCounts };
}