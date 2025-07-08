import { SupabaseFavoritesService } from "../services/supabase-favorites";
import { useAppStore } from "../store/useAppStore";

/**
 * @function migrateFavoritesToSupabase
 * @description Migrate favorites from localStorage to Supabase
 */
export async function migrateFavoritesToSupabase(favoritesService: SupabaseFavoritesService | null): Promise<{
    success: boolean;
    migrated: number;
    errors: string[];
}> {
    const { favorites } = useAppStore.getState();
    
    if (!favoritesService) {
        return {
            success: false,
            migrated: 0,
            errors: ['User not authenticated']
        };
    }

    const results = {
        success: true,
        migrated: 0,
        errors: [] as string[]
    };

    // Get local favorites
    const localFavorites = Array.from(favorites);
    
    if (localFavorites.length === 0) {
        return results;
    }

    console.log(`Migrating ${localFavorites.length} favorites to Supabase...`);

    try {
        // Sync with Supabase (this will add local favorites to Supabase)
        const syncedFavorites = await favoritesService.syncWithLocal(localFavorites);
        results.migrated = syncedFavorites.length;
        
        console.log(`Successfully migrated ${results.migrated} favorites to Supabase`);
    } catch (error) {
        results.success = false;
        results.errors.push(error instanceof Error ? error.message : 'Unknown error');
        console.error('Failed to migrate favorites:', error);
    }

    return results;
}

/**
 * @function useFavoritesMigration
 * @description Hook to manage favorites migration
 */
export function useFavoritesMigration() {
    const migrate = async (favoritesService: SupabaseFavoritesService | null) => {
        return await migrateFavoritesToSupabase(favoritesService);
    };

    return { migrate };
}