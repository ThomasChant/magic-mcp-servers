import { Heart } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

interface FavoriteButtonProps {
    serverId: string;
    className?: string;
    size?: "sm" | "md" | "lg";
    showText?: boolean;
}

export function FavoriteButton({ 
    serverId, 
    className = "", 
    size = "md", 
    showText = false 
}: FavoriteButtonProps) {
    const { favorites, toggleFavorite } = useAppStore();
    const isFavorited = favorites.has(serverId);

    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6"
    };

    const buttonSizeClasses = {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-2 text-sm",
        lg: "px-4 py-3 text-base"
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(serverId);
    };

    return (
        <button
            onClick={handleClick}
            className={`
                inline-flex items-center gap-2 rounded-lg border transition-all duration-200
                ${isFavorited
                    ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                }
                ${buttonSizeClasses[size]}
                ${className}
            `}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart 
                className={`${sizeClasses[size]} transition-colors duration-200 ${
                    isFavorited ? "fill-current" : ""
                }`}
            />
            {showText && (
                <span className="font-medium">
                    {isFavorited ? "Favorited" : "Favorite"}
                </span>
            )}
        </button>
    );
}