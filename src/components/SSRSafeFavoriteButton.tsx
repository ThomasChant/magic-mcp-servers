import React from "react";
import { FavoriteButton } from "./FavoriteButton";
import { isClientSide } from "../utils/environment";

interface SSRSafeFavoriteButtonProps {
  serverId: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SSRSafeFavoriteButton(props: SSRSafeFavoriteButtonProps) {
  // Skip rendering during SSR to avoid Clerk Provider issues
  if (!isClientSide()) {
    return (
      <button
        className={`inline-flex items-center justify-center px-3 py-2 border-2 border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium ${props.className || ""}`}
        disabled
      >
        <svg 
          className="h-4 w-4 mr-1.5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
        {props.showText && "收藏"}
      </button>
    );
  }

  // Render the actual FavoriteButton on the client side
  return <FavoriteButton {...props} />;
}