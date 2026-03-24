import { useEffect, useState, useCallback } from 'react';
import type { FC } from 'react';
import {
  getUserGroups,
  createGroup,
  joinGroupByInviteCode,
  leaveGroup,
  deleteGroup,
  getGroupMembers,
  getGroupPosts,
  shareProductToGroup,
  removeGroupPost,
  getUserLikedProductsWithDetails,
} from '../services/firestoreService';
import type { GroupPostWithProduct } from '../services/firestoreService';
import type { Group, GroupMember, Product } from '../types';
import '../styles/Groups.css';

interface GroupsProps {
  userId: string;
  userName: string;
  userPhoto?: string;
  onProductClick: (product: Product) => void;
}

type View = 'list' | 'create' | 'join' | 'detail';

export const Groups: FC<GroupsProps> = ({ userId, userName, userPhoto, onProductClick }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('list');

  // Create form
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Join form
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Detail view
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [posts, setPosts] = useState<GroupPostWithProduct[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<'feed' | 'members'>('feed');
  const [copiedCode, setCopiedCode] = useState(false);

  // Share product
  const [showSharePicker, setShowSharePicker] = useState(false);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductToShare, setSelectedProductToShare] = useState<Product | null>(null);
  const [shareComment, setShareComment] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserGroups(userId);
      setGroups(data);
    } catch {
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const group = await createGroup(newName.trim(), newDescription.trim(), userId, userName, userPhoto);
      setGroups(prev => [group, ...prev]);
      setNewName('');
      setNewDescription('');
      setView('list');
    } catch {
      setError('Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setJoining(true);
    setJoinError(null);
    try {
      const group = await joinGroupByInviteCode(inviteCode.trim(), userId);
      setGroups(prev => [group, ...prev]);
      setInviteCode('');
      setView('list');
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join group');
    } finally {
      setJoining(false);
    }
  };

  const handleOpenDetail = async (group: Group) => {
    setSelectedGroup(group);
    setView('detail');
    setDetailTab('feed');
    setDetailLoading(true);
    setShowSharePicker(false);
    try {
      const [membersData, postsData] = await Promise.all([
        getGroupMembers(group.members),
        getGroupPosts(group.id!),
      ]);
      setMembers(membersData);
      setPosts(postsData);
    } catch {
      setError('Failed to load group details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleLeave = async (group: Group) => {
    if (!confirm(`Leave "${group.name}"?`)) return;
    try {
      await leaveGroup(group.id!, userId);
      setGroups(prev => prev.filter(g => g.id !== group.id));
      if (selectedGroup?.id === group.id) setView('list');
    } catch {
      setError('Failed to leave group');
    }
  };

  const handleDelete = async (group: Group) => {
    if (!confirm(`Delete "${group.name}"? All posts will be removed. This cannot be undone.`)) return;
    try {
      await deleteGroup(group.id!);
      setGroups(prev => prev.filter(g => g.id !== group.id));
      if (selectedGroup?.id === group.id) setView('list');
    } catch {
      setError('Failed to delete group');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  const handleOpenSharePicker = async () => {
    setShowSharePicker(true);
    setSelectedProductToShare(null);
    setShareComment('');
    setShareError(null);
    setLoadingProducts(true);
    try {
      const products = await getUserLikedProductsWithDetails(userId);
      setUserProducts(products);
    } catch {
      setShareError('Failed to load your products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleShareProduct = async () => {
    if (!selectedProductToShare?.id || !selectedGroup?.id) return;

    setSharing(true);
    setShareError(null);
    try {
      const newPost = await shareProductToGroup(
        selectedGroup.id,
        selectedProductToShare.id,
        userId,
        userName,
        userPhoto,
        shareComment.trim() || undefined
      );
      const postWithProduct: GroupPostWithProduct = {
        ...newPost,
        product: selectedProductToShare,
      };
      setPosts(prev => [postWithProduct, ...prev]);
      setShowSharePicker(false);
      setSelectedProductToShare(null);
      setShareComment('');
    } catch (err) {
      setShareError(err instanceof Error ? err.message : 'Failed to share product');
    } finally {
      setSharing(false);
    }
  };

  const handleRemovePost = async (postId: string) => {
    if (!confirm('Remove this post from the group?')) return;
    try {
      await removeGroupPost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch {
      setError('Failed to remove post');
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="groups-loading">
        <div className="groups-spinner" />
        <p>Loading your groups...</p>
      </div>
    );
  }

  // Create Group form
  if (view === 'create') {
    return (
      <div className="groups-container">
        <button className="groups-back-btn" onClick={() => setView('list')}>
          ← Back to Groups
        </button>
        <h3 className="groups-view-title">Create a Group</h3>
        <p className="groups-view-subtitle">
          Create a topic-based group (e.g. Wine, Craft Beer, Soft Drinks) and invite others to share their finds.
        </p>
        <form className="groups-form" onSubmit={handleCreate}>
          <div className="groups-form-field">
            <label htmlFor="group-name">Group Name</label>
            <input
              id="group-name"
              type="text"
              placeholder="e.g. Wine Lovers, Craft Beer Club"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              maxLength={50}
              required
            />
          </div>
          <div className="groups-form-field">
            <label htmlFor="group-desc">Description</label>
            <textarea
              id="group-desc"
              placeholder="What kind of products should be shared here?"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </div>
          {error && <div className="groups-error-inline">{error}</div>}
          <button type="submit" className="groups-submit-btn" disabled={creating || !newName.trim()}>
            {creating ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    );
  }

  // Join Group form
  if (view === 'join') {
    return (
      <div className="groups-container">
        <button className="groups-back-btn" onClick={() => { setView('list'); setJoinError(null); }}>
          ← Back to Groups
        </button>
        <h3 className="groups-view-title">Join a Group</h3>
        <form className="groups-form" onSubmit={handleJoin}>
          <div className="groups-form-field">
            <label htmlFor="invite-code">Invite Code</label>
            <input
              id="invite-code"
              type="text"
              placeholder="e.g. A3B7K9"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="groups-code-input"
              required
            />
          </div>
          {joinError && <div className="groups-error-inline">{joinError}</div>}
          <button type="submit" className="groups-submit-btn" disabled={joining || inviteCode.trim().length < 6}>
            {joining ? 'Joining...' : 'Join Group'}
          </button>
        </form>
      </div>
    );
  }

  // Group detail view
  if (view === 'detail' && selectedGroup) {
    const isAdmin = selectedGroup.createdBy === userId;

    return (
      <div className="groups-container">
        <button className="groups-back-btn" onClick={() => setView('list')}>
          ← Back to Groups
        </button>

        <div className="groups-detail-header">
          <h3 className="groups-detail-name">{selectedGroup.name}</h3>
          {selectedGroup.description && (
            <p className="groups-detail-desc">{selectedGroup.description}</p>
          )}
          <div className="groups-detail-meta">
            <span className="groups-detail-members-count">
              👥 {selectedGroup.members.length} member{selectedGroup.members.length !== 1 ? 's' : ''}
            </span>
            <span className="groups-detail-divider">·</span>
            <span className="groups-detail-created">
              Created by {selectedGroup.createdByName}
            </span>
          </div>

          <div className="groups-invite-section">
            <span className="groups-invite-label">Invite Code:</span>
            <span className="groups-invite-code">{selectedGroup.inviteCode}</span>
            <button
              className="groups-copy-btn"
              onClick={() => handleCopyCode(selectedGroup.inviteCode)}
            >
              {copiedCode ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>

          <div className="groups-detail-actions">
            {isAdmin ? (
              <button className="groups-danger-btn" onClick={() => handleDelete(selectedGroup)}>
                🗑️ Delete Group
              </button>
            ) : (
              <button className="groups-danger-btn" onClick={() => handleLeave(selectedGroup)}>
                🚪 Leave Group
              </button>
            )}
          </div>
        </div>

        <div className="groups-detail-tabs">
          <button
            className={`groups-detail-tab ${detailTab === 'feed' ? 'active' : ''}`}
            onClick={() => setDetailTab('feed')}
          >
            📋 Feed ({posts.length})
          </button>
          <button
            className={`groups-detail-tab ${detailTab === 'members' ? 'active' : ''}`}
            onClick={() => setDetailTab('members')}
          >
            👥 Members
          </button>
        </div>

        {detailLoading ? (
          <div className="groups-loading">
            <div className="groups-spinner" />
            <p>Loading...</p>
          </div>
        ) : detailTab === 'feed' ? (
          <div className="groups-feed">
            {!showSharePicker && (
              <button className="groups-share-btn" onClick={handleOpenSharePicker}>
                ➕ Share a Product
              </button>
            )}

            {/* Share Product Picker */}
            {showSharePicker && (
              <div className="groups-share-picker">
                <div className="groups-share-picker-header">
                  <h4>Share a product to {selectedGroup.name}</h4>
                  <button
                    className="groups-share-picker-close"
                    onClick={() => setShowSharePicker(false)}
                  >
                    ✕
                  </button>
                </div>

                {selectedProductToShare ? (
                  <div className="groups-share-confirm">
                    <div className="groups-share-selected-product">
                      {selectedProductToShare.imageUrl ? (
                        <img src={selectedProductToShare.imageUrl} alt={selectedProductToShare.name} className="groups-share-product-img" />
                      ) : (
                        <div className="groups-share-product-no-img">📦</div>
                      )}
                      <div className="groups-share-product-info">
                        <span className="groups-share-product-name">{selectedProductToShare.name}</span>
                        <span className="groups-share-product-brand">{selectedProductToShare.brand}</span>
                      </div>
                      <button
                        className="groups-share-change-btn"
                        onClick={() => setSelectedProductToShare(null)}
                      >
                        Change
                      </button>
                    </div>
                    <div className="groups-form-field">
                      <label htmlFor="share-comment">Add a comment (optional)</label>
                      <textarea
                        id="share-comment"
                        placeholder="Why do you recommend this? Any tasting notes?"
                        value={shareComment}
                        onChange={e => setShareComment(e.target.value)}
                        maxLength={300}
                        rows={2}
                      />
                    </div>
                    {shareError && <div className="groups-error-inline">{shareError}</div>}
                    <button
                      className="groups-submit-btn"
                      onClick={handleShareProduct}
                      disabled={sharing}
                    >
                      {sharing ? 'Sharing...' : 'Share to Group'}
                    </button>
                  </div>
                ) : (
                  <div className="groups-share-product-list">
                    {loadingProducts ? (
                      <div className="groups-loading">
                        <div className="groups-spinner" />
                        <p>Loading your liked products...</p>
                      </div>
                    ) : userProducts.length === 0 ? (
                      <div className="groups-share-empty">
                        <p>You haven't liked any products yet.</p>
                        <p className="groups-empty-hint">Scan and like a product first, then share it here!</p>
                      </div>
                    ) : (
                      <>
                        <p className="groups-share-instruction">Select a product from your likes to share:</p>
                        <div className="groups-share-grid">
                          {userProducts.map(product => (
                            <div
                              key={product.id}
                              className="groups-share-product-card"
                              onClick={() => setSelectedProductToShare(product)}
                            >
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="groups-share-card-img" />
                              ) : (
                                <div className="groups-share-card-no-img">📦</div>
                              )}
                              <div className="groups-share-card-info">
                                <span className="groups-share-card-name">{product.name}</span>
                                <span className="groups-share-card-brand">{product.brand}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Posts Feed */}
            {posts.length === 0 && !showSharePicker ? (
              <div className="groups-empty-feed">
                <div className="groups-empty-icon">📭</div>
                <p>No products shared yet</p>
                <p className="groups-empty-hint">Be the first to share a product with this group!</p>
              </div>
            ) : (
              <div className="groups-posts-list">
                {posts.map(post => (
                  <div key={post.id} className="groups-post-card">
                    <div className="groups-post-header">
                      <div className="groups-post-author">
                        {post.postedByPhoto ? (
                          <img src={post.postedByPhoto} alt={post.postedByName} className="groups-post-avatar" />
                        ) : (
                          <div className="groups-post-avatar-placeholder">
                            {post.postedByName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="groups-post-author-info">
                          <span className="groups-post-author-name">{post.postedByName}</span>
                          <span className="groups-post-time">{formatTimeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                      {(post.postedBy === userId || isAdmin) && (
                        <button
                          className="groups-post-remove-btn"
                          onClick={() => handleRemovePost(post.id!)}
                          title={isAdmin && post.postedBy !== userId ? 'Remove (Admin)' : 'Remove your post'}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {post.comment && (
                      <p className="groups-post-comment">{post.comment}</p>
                    )}

                    <div
                      className="groups-post-product"
                      onClick={() => onProductClick(post.product)}
                    >
                      <div className="groups-post-product-image-wrapper">
                        {post.product.imageUrl ? (
                          <img src={post.product.imageUrl} alt={post.product.name} className="groups-post-product-image" />
                        ) : (
                          <div className="groups-post-product-no-image">📦</div>
                        )}
                      </div>
                      <div className="groups-post-product-info">
                        <h4 className="groups-post-product-name">{post.product.name}</h4>
                        <p className="groups-post-product-brand">{post.product.brand}</p>
                        <span className="groups-post-product-cta">View details →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="groups-members-list">
            {members.map(member => (
              <div key={member.uid} className="groups-member-card">
                {member.photoURL ? (
                  <img src={member.photoURL} alt={member.displayName} className="groups-member-avatar" />
                ) : (
                  <div className="groups-member-avatar-placeholder">
                    {member.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="groups-member-info">
                  <span className="groups-member-name">
                    {member.displayName}
                    {member.uid === selectedGroup.createdBy && (
                      <span className="groups-member-badge">Admin</span>
                    )}
                    {member.uid === userId && (
                      <span className="groups-member-badge you">You</span>
                    )}
                  </span>
                  <span className="groups-member-email">{member.email}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Groups list (default view)
  return (
    <div className="groups-container">
      <div className="groups-action-bar">
        <button className="groups-action-btn create" onClick={() => setView('create')}>
          ➕ Create Group
        </button>
        <button className="groups-action-btn join" onClick={() => setView('join')}>
          🔗 Join with Code
        </button>
      </div>

      {error && <div className="groups-error-inline">{error}</div>}

      {groups.length === 0 ? (
        <div className="groups-empty">
          <div className="groups-empty-icon">👥</div>
          <p>You're not in any groups yet</p>
          <p className="groups-empty-hint">
            Create a topic group (e.g. Wine, Soft Drinks) and invite friends to share their favourite products
          </p>
        </div>
      ) : (
        <div className="groups-list">
          {groups.map(group => (
            <div
              key={group.id}
              className="groups-card"
              onClick={() => handleOpenDetail(group)}
            >
              <div className="groups-card-header">
                <h3 className="groups-card-name">{group.name}</h3>
                {group.createdBy === userId && (
                  <span className="groups-card-owner-badge">Admin</span>
                )}
              </div>
              {group.description && (
                <p className="groups-card-desc">{group.description}</p>
              )}
              <div className="groups-card-footer">
                <span className="groups-card-members">
                  👥 {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                </span>
                <span className="groups-card-date">
                  Created {group.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
