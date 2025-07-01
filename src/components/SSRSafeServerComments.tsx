import React from "react";
import ServerCommentsWithReplies from "./ServerCommentsWithReplies";
import { isClientSide } from "../utils/environment";
import { MessageSquare } from "lucide-react";

interface SSRSafeServerCommentsProps {
  serverId: string;
}

export function SSRSafeServerComments({ serverId }: SSRSafeServerCommentsProps) {
  // Skip rendering during SSR to avoid Clerk Provider issues
  if (!isClientSide()) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Comments
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-4 w-4" />
            <span>Loading comments...</span>
          </div>
        </div>
        
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>Comments will load after page initialization.</p>
        </div>
      </div>
    );
  }

  // Render the actual ServerCommentsWithReplies on the client side
  return <ServerCommentsWithReplies serverId={serverId} />;
}