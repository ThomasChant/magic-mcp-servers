import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import type { Comment, CommentInsert, CommentUpdate } from '../types';

/**
 * Hook to fetch comments for a specific server
 */
export const useComments = (serverId: string) => {
  return useQuery({
    queryKey: ['comments', serverId],
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('server_id', serverId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch comments: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!serverId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to add a new comment
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