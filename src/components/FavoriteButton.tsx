import { Heart, Loader2, Cloud, CloudOff, AlertCircle } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useSupabaseFavoritesService } from "../services/supabase-favorites";
import { useFavoritesSync } from "../hooks/useFavoritesSync";

interface FavoriteButtonProps {
    serverId: string;
    className?: string;
    size?: "sm" | "md" | "lg";
    showText?: boolean;
    showSyncStatus?: boolean;
}

export function FavoriteButton({ 
    serverId, 
    className = "", 
    size = "md", 
    showText = false,
    showSyncStatus = false
}: FavoriteButtonProps) {
    const { 
        toggleFavorite, 
        favoritesLoading, 
        favoritesError, 
        isFavorite 
    } = useAppStore();
    const favoritesService = useSupabaseFavoritesService();
    const { isOnline, retrySync } = useFavoritesSync();
    
    const isFavorited = isFavorite(serverId);
    const isCurrentlyLoading = favoritesLoading;

    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6"
    };

    const buttonSizeClasses = {
        sm: "px-2 py-1.5 text-xs",
        md: "px-3 py-2 text-sm",
        lg: "px-4 py-3 text-base"
    };

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isCurrentlyLoading) return;
        
        try {
            await toggleFavorite(serverId, favoritesService);
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
        }
    };

    const handleRetrySync = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await retrySync();
    };

    return (
        <div className="relative">
            <button
                onClick={handleClick}
                disabled={isCurrentlyLoading}
                className={`
                    inline-flex items-center justify-center gap-2 rounded-lg border transition-all duration-200
                    ${isCurrentlyLoading ? "opacity-70 cursor-not-allowed" : ""}
                    ${isFavorited
                        ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                    }
                    ${showText ? buttonSizeClasses[size] : size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12'}
                    ${className}
                `}
                title={
                    isCurrentlyLoading 
                        ? "Syncing..." 
                        : isFavorited 
                            ? "Remove from favorites" 
                            : "Add to favorites"
                }
            >
                {isCurrentlyLoading ? (
                    <Loader2 className={`${sizeClasses[size]} animate-spin`} />
                ) : (
                    <Heart 
                        className={`${sizeClasses[size]} transition-colors duration-200 ${
                            isFavorited ? "fill-current" : ""
                        }`}
                    />
                )}
                {showText && (
                    <span className="font-medium">
                        {isCurrentlyLoading 
                            ? "Syncing..." 
                            : isFavorited 
                                ? "Favorited" 
                                : "Favorite"
                        }
                    </span>
                )}
            </button>

            {/* Sync Status Indicator */}
            {showSyncStatus && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                    {favoritesError ? (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <AlertCircle className="h-3 w-3" />
                            <span>Sync failed</span>
                            <button
                                onClick={handleRetrySync}
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className={`flex items-center gap-1 ${
                            isOnline 
                                ? "text-green-600 dark:text-green-400" 
                                : "text-amber-600 dark:text-amber-400"
                        }`}>
                            {isOnline ? (
                                <>
                                    <Cloud className="h-3 w-3" />
                                    <span>Synced</span>
                                </>
                            ) : (
                                <>
                                    <CloudOff className="h-3 w-3" />
                                    <span>Local only</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}