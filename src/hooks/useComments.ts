import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import type { Comment, CommentInsert, CommentUpdate } from '../types';

/**
 * Hook to fetch comments for a specific server with nested replies
 */
export const useComments = (serverId: string) => {
  return useQuery({
    queryKey: ['comments', serverId],
    queryFn: async (): Promise<Comment[]> => {
      // First, fetch all comments for this server
      const { data: allComments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('server_id', serverId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch comments: ${error.message}`);
      }

      if (!allComments || allComments.length === 0) {
        return [];
      }

      // Build a tree structure for nested comments
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      // First pass: create all comment objects with empty replies arrays
      allComments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      // Second pass: build the tree structure
      allComments.forEach(comment => {
        const commentWithReplies = commentMap.get(comment.id)!;
        
        if (!comment.parent_id) {
          // This is a root comment
          rootComments.push(commentWithReplies);
        } else {
          // This is a reply, add it to its parent's replies array
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies!.push(commentWithReplies);
          }
        }
      });

      // Sort replies by creation date (oldest first)
      const sortReplies = (comments: Comment[]) => {
        comments.forEach(comment => {
          if (comment.replies && comment.replies.length > 0) {
            comment.replies.sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            sortReplies(comment.replies);
          }
        });
      };

      sortReplies(rootComments);

      return rootComments;
    },
    enabled: !!serverId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to add a new comment or reply
 */
export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (commentData: Omit<CommentInsert, 'user_id' | 'user_name' | 'user_email'>): Promise<Comment> => {
      if (!user) {
        throw new Error('User must be logged in to comment');
      }

      const newComment: CommentInsert = {
        ...commentData,
        user_id: user.id,
        user_name: user.fullName || user.firstName || 'Anonymous',
        user_email: user.primaryEmailAddress?.emailAddress,
      };

      const { data, error } = await supabase
        .from('comments')
        .insert([newComment])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add comment: ${error.message}`);
      }

      return data;
    },
    onSuccess: (newComment) => {
      // Invalidate and refetch comments for this server
      queryClient.invalidateQueries({ 
        queryKey: ['comments', newComment.server_id] 
      });
      // Also invalidate comment stats
      queryClient.invalidateQueries({ 
        queryKey: ['comments', 'stats', newComment.server_id] 
      });
    },
  });
};

/**
 * Hook to update a comment
 */
export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({ 
      commentId, 
      updates 
    }: { 
      commentId: string; 
      updates: CommentUpdate;
    }): Promise<Comment> => {
      if (!user) {
        throw new Error('User must be logged in to update comments');
      }

      const { data, error } = await supabase
        .from('comments')
        .update(updates)
        .eq('id', commentId)
        .eq('user_id', user.id) // Ensure user can only update their own comments
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update comment: ${error.message}`);
      }

      return data;
    },
    onSuccess: (updatedComment) => {
      // Invalidate and refetch comments for this server
      queryClient.invalidateQueries({ 
        queryKey: ['comments', updatedComment.server_id] 
      });
    },
  });
};

/**
 * Hook to delete a comment
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({ 
      commentId 
    }: { 
      commentId: string; 
      serverId: string;
    }): Promise<void> => {
      if (!user) {
        throw new Error('User must be logged in to delete comments');
      }

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // Ensure user can only delete their own comments

      if (error) {
        throw new Error(`Failed to delete comment: ${error.message}`);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch comments for this server
      queryClient.invalidateQueries({ 
        queryKey: ['comments', variables.serverId] 
      });
    },
  });
};

/**
 * Hook to get comment statistics for a server
 */
export const useCommentStats = (serverId: string) => {
  return useQuery({
    queryKey: ['comments', 'stats', serverId],
    queryFn: async (): Promise<{ count: number }> => {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('server_id', serverId);

      if (error) {
        throw new Error(`Failed to fetch comment stats: ${error.message}`);
      }

      return { count: count || 0 };
    },
    enabled: !!serverId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};