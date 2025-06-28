import React, { useState } from 'react';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { MessageSquare, Edit2, Trash2, Save, X, User, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { useComments, useAddComment, useUpdateComment, useDeleteComment, useCommentStats } from '../hooks/useComments';
import type { Comment } from '../types';

interface ServerCommentsProps {
  serverId: string;
}

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  onUpdate: (commentId: string, content: string) => void;
  editingCommentId: string | null;
  editingText: string;
  onEditingTextChange: (text: string) => void;
  currentUserId?: string;
  level?: number;
  isPending?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onUpdate,
  editingCommentId,
  editingText,
  onEditingTextChange,
  currentUserId,
  level = 0,
  isPending = false,
}) => {
  const [showReplies, setShowReplies] = useState(true);
  const isOwner = currentUserId === comment.user_id;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const replyCount = comment.reply_count || comment.replies?.length || 0;

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
    <div className={`${level > 0 ? 'ml-12 mt-4' : ''}`}>
      <div className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-6 ${level > 0 ? 'border-l-4 border-blue-400' : ''}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <div className={`${level > 0 ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center`}>
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

          <div className="flex items-center space-x-2">
            {currentUserId && (
              <button
                onClick={() => onReply(comment.id)}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Reply to comment"
              >
                <Reply className="h-4 w-4" />
              </button>
            )}
            
            {isOwner && (
              <>
                {editingCommentId === comment.id ? (
                  <>
                    <button
                      onClick={() => onUpdate(comment.id, editingText)}
                      disabled={isPending}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Save changes"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit({ ...comment, content: '' })}
                      className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="Cancel editing"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onEdit(comment)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit comment"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(comment.id)}
                      disabled={isPending}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {editingCommentId === comment.id ? (
          <textarea
            value={editingText}
            onChange={(e) => onEditingTextChange(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isPending}
          />
        ) : (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {hasReplies && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="mt-4 flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {showReplies ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
          </button>
        )}
      </div>

      {showReplies && comment.replies && comment.replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdate={onUpdate}
          editingCommentId={editingCommentId}
          editingText={editingText}
          onEditingTextChange={onEditingTextChange}
          currentUserId={currentUserId}
          level={level + 1}
          isPending={isPending}
        />
      ))}
    </div>
  );
};

const ServerCommentsWithReplies: React.FC<ServerCommentsProps> = ({ serverId }) => {
  const { user, isSignedIn } = useUser();
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

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

  const handleAddReply = async () => {
    if (!replyText.trim() || !isSignedIn || !replyingToId) return;

    try {
      await addCommentMutation.mutateAsync({
        server_id: serverId,
        content: replyText.trim(),
        parent_id: replyingToId,
      });
      setReplyText('');
      setReplyingToId(null);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const startReplying = (parentId: string) => {
    setReplyingToId(parentId);
    setReplyText('');
  };

  const cancelReply = () => {
    setReplyingToId(null);
    setReplyText('');
  };

  const startEditing = (comment: Comment) => {
    if (comment.content) {
      setEditingCommentId(comment.id);
      setEditingText(comment.content);
    } else {
      setEditingCommentId(null);
      setEditingText('');
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    if (!content.trim()) return;

    try {
      await updateCommentMutation.mutateAsync({
        commentId,
        updates: { content: content.trim() },
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

      {/* Reply Form */}
      {replyingToId && isSignedIn && (
        <div className="ml-12 mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-400">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Replying to comment
          </h4>
          <div className="space-y-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={addCommentMutation.isPending}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelReply}
                className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddReply}
                disabled={!replyText.trim() || addCommentMutation.isPending}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Reply className="h-3 w-3" />
                <span>{addCommentMutation.isPending ? 'Posting...' : 'Post Reply'}</span>
              </button>
            </div>
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
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={startReplying}
            onEdit={startEditing}
            onDelete={handleDeleteComment}
            onUpdate={handleUpdateComment}
            editingCommentId={editingCommentId}
            editingText={editingText}
            onEditingTextChange={setEditingText}
            currentUserId={user?.id}
            isPending={updateCommentMutation.isPending || deleteCommentMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
};

export default ServerCommentsWithReplies;