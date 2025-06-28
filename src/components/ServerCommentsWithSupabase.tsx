import React, { useState } from 'react';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { MessageSquare, Edit2, Trash2, Save, X, User } from 'lucide-react';
import { useComments, useAddComment, useUpdateComment, useDeleteComment, useCommentStats } from '../hooks/useComments';
import type { Comment } from '../types';

interface ServerCommentsProps {
  serverId: string;
}

const ServerCommentsWithSupabase: React.FC<ServerCommentsProps> = ({ serverId }) => {
  const { user, isSignedIn } = useUser();
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Query hooks
  const { data: comments = [], isLoading: commentsLoading, error: commentsError } = useComments(serverId);
  const { data: stats } = useCommentStats(serverId);

  // Mutation hooks
  const addCommentMutation = useAddComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  // Handlers
  const handleAddComment = async () => {
    if (!newCommentText.trim() || !isSignedIn) return;

    try {
      await addCommentMutation.mutateAsync({
        server_id: serverId,
        content: newCommentText.trim(),
      });
      setNewCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingText.trim()) return;

    try {
      await updateCommentMutation.mutateAsync({
        commentId,
        updates: { content: editingText.trim() },
      });
      setEditingCommentId(null);
      setEditingText('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteCommentMutation.mutateAsync({
        commentId,
        serverId,
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Comments
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <MessageSquare className="h-4 w-4" />
          <span>{stats?.count || 0} comments</span>
        </div>
      </div>

      {/* Add Comment Form */}
      {isSignedIn ? (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Add a Comment
          </h3>
          <div className="space-y-4">
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Share your thoughts about this MCP server..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              disabled={addCommentMutation.isPending}
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddComment}
                disabled={!newCommentText.trim() || addCommentMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Sign in to join the conversation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Share your thoughts and help the community learn more about this MCP server.
            </p>
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {commentsLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading comments...</p>
          </div>
        )}

        {commentsError && (
          <div className="text-center py-8 text-red-500">
            <p>Error loading comments: {commentsError.message}</p>
          </div>
        )}

        {!commentsLoading && !commentsError && comments.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {comment.user_name ? (
                    <span className="text-white text-sm font-semibold">
                      {getInitials(comment.user_name)}
                    </span>
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {comment.user_name || 'Anonymous'}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(comment.created_at)}
                    {comment.updated_at !== comment.created_at && ' (edited)'}
                  </p>
                </div>
              </div>

              {/* Action buttons for comment owner */}
              {isSignedIn && user?.id === comment.user_id && (
                <div className="flex items-center space-x-2">
                  {editingCommentId === comment.id ? (
                    <>
                      <button
                        onClick={() => handleUpdateComment(comment.id)}
                        disabled={updateCommentMutation.isPending}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Save changes"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        title="Cancel editing"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(comment)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit comment"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Comment content */}
            {editingCommentId === comment.id ? (
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                disabled={updateCommentMutation.isPending}
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServerCommentsWithSupabase;