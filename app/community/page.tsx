'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Code2,
  Globe,
  GraduationCap,
  Heart,
  Landmark,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Circle = {
  id: string;
  name: string;
  description: string | null;
};

type Member = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  tech_stack?: string | null;
};

type FeedPost = {
  id: string;
  content: string;
  created_at: string;
  circle_id: string;
  user_id: string;
  authorName: string;
  authorAvatar: string | null;
  likeCount: number;
  commentCount: number;
};

const CIRCLE_ORDER = ['tech', 'nysc', 'fintech', 'remote'];

function sortCircles(circles: Circle[]): Circle[] {
  return [...circles].sort((a, b) => {
    const aRank = CIRCLE_ORDER.findIndex((key) => a.name.toLowerCase().includes(key));
    const bRank = CIRCLE_ORDER.findIndex((key) => b.name.toLowerCase().includes(key));
    return (aRank === -1 ? 99 : aRank) - (bRank === -1 ? 99 : bRank);
  });
}

function circleIcon(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes('tech')) return Code2;
  if (normalized.includes('nysc')) return GraduationCap;
  if (normalized.includes('fintech')) return Landmark;
  return Globe;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  const initials = name
    .trim()
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
  return initials || 'U';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

  return new Date(iso).toLocaleDateString('en-US', { timeZone: 'UTC' });
}

async function fetchFeed(circleId: string): Promise<FeedPost[]> {
  const { data: postRows, error } = await supabase
    .from('posts')
    .select('id, content, created_at, circle_id, user_id')
    .eq('circle_id', circleId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Failed to load community posts:', error);
    return [];
  }

  if (!postRows || postRows.length === 0) return [];

  const postIds = postRows.map((post) => post.id);
  const userIds = Array.from(new Set(postRows.map((post) => post.user_id)));

  const [{ data: people }, { data: likeRows }, { data: commentRows }] =
    await Promise.all([
      supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds),
      supabase.from('likes').select('post_id').in('post_id', postIds),
      supabase.from('comments').select('post_id').in('post_id', postIds),
    ]);

  const peopleById = new Map((people ?? []).map((person) => [person.id, person]));
  const likeCounts = new Map<string, number>();
  const commentCounts = new Map<string, number>();

  for (const like of likeRows ?? []) {
    likeCounts.set(like.post_id, (likeCounts.get(like.post_id) ?? 0) + 1);
  }
  for (const comment of commentRows ?? []) {
    commentCounts.set(comment.post_id, (commentCounts.get(comment.post_id) ?? 0) + 1);
  }

  return postRows.map((post) => {
    const author = peopleById.get(post.user_id);
    return {
      ...post,
      authorName: author?.full_name || 'DevCraft Member',
      authorAvatar: author?.avatar_url ?? null,
      likeCount: likeCounts.get(post.id) ?? 0,
      commentCount: commentCounts.get(post.id) ?? 0,
    };
  });
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
  };
}

function Avatar({
  name,
  src,
  size = 'md',
}: {
  name: string | null;
  src: string | null;
  size?: 'sm' | 'md';
}) {
  const dimensions = size === 'sm' ? 'h-8 w-8 text-[10px]' : 'h-10 w-10 text-xs';

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'Member avatar'}
        className={`${dimensions} shrink-0 rounded-full border border-slate-700 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${dimensions} flex shrink-0 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/15 font-bold text-orange-300`}
    >
      {getInitials(name)}
    </div>
  );
}

export default function CommunityPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [me, setMe] = useState<Member | null>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [activeCircleId, setActiveCircleId] = useState('');
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [suggested, setSuggested] = useState<Member[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<Record<string, { id: string; content: string }[]>>({});
  const [error, setError] = useState('');

  const activeCircle = circles.find((circle) => circle.id === activeCircleId) ?? null;

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      if (cancelled) return;
      setUserId(user.id);

      const [
        { data: circleRows, error: circleError },
        { data: myProfile },
        { data: people },
        { data: myLikes },
      ] = await Promise.all([
        supabase.from('circles').select('id, name, description').order('name'),
        supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('id, full_name, avatar_url, tech_stack')
          .neq('id', user.id)
          .limit(5),
        supabase.from('likes').select('post_id').eq('user_id', user.id),
      ]);

      if (cancelled) return;

      if (circleError) setError(circleError.message);

      const sortedCircles = sortCircles(circleRows ?? []);
      setCircles(sortedCircles);
      setMe(myProfile ?? null);
      setSuggested(people ?? []);
      setLikedIds(new Set((myLikes ?? []).map((like) => like.post_id)));
      setActiveCircleId(sortedCircles[0]?.id ?? '');
      setLoading(false);
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSelectCircle = (circleId: string) => {
    if (circleId === activeCircleId) return;
    setFeedLoading(true);
    setActiveCircleId(circleId);
  };

  useEffect(() => {
    if (!activeCircleId) return;

    let cancelled = false;

    fetchFeed(activeCircleId).then((rows) => {
      if (!cancelled) {
        setPosts(rows);
        setFeedLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeCircleId]);

  const handlePost = async () => {
    const text = content.trim();
    if (!text || !userId || !activeCircleId || posting) return;

    setPosting(true);
    setError('');

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ content: text, circle_id: activeCircleId }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create post.');
      }

      setContent('');
      const rows = await fetchFeed(activeCircleId);
      setPosts(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post.');
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!userId) return;

    const wasLiked = likedIds.has(postId);

    setLikedIds((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, likeCount: Math.max(0, post.likeCount + (wasLiked ? -1 : 1)) }
          : post
      )
    );

    try {
      const res = await fetch('/api/community/likes', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ post_id: postId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        liked?: boolean;
        likeCount?: number;
      };

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update like.');
      }

      if (typeof data.liked === 'boolean') {
        const liked = data.liked;
        setLikedIds((prev) => {
          const next = new Set(prev);
          if (liked) next.add(postId);
          else next.delete(postId);
          return next;
        });
      }

      if (typeof data.likeCount === 'number') {
        const likeCount = data.likeCount;
        setPosts((prev) =>
          prev.map((post) => (post.id === postId ? { ...post, likeCount } : post))
        );
      }
    } catch (err) {
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(postId);
        else next.delete(postId);
        return next;
      });
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, likeCount: Math.max(0, post.likeCount + (wasLiked ? 1 : -1)) }
            : post
        )
      );
      setError(err instanceof Error ? err.message : 'Failed to update like.');
    }
  };

  const handleComment = async (postId: string) => {
    const draft = (commentDrafts[postId] ?? '').trim();
    if (!draft || commentingPostId) return;

    setCommentingPostId(postId);
    setError('');

    try {
      const res = await fetch('/api/community/comments', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ post_id: postId, content: draft }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        id?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add comment.');
      }

      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      setLocalComments((prev) => ({
        ...prev,
        [postId]: [
          ...(prev[postId] ?? []),
          { id: data.id ?? `${postId}-${Date.now()}`, content: draft },
        ],
      }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, commentCount: post.commentCount + 1 } : post
        )
      );
      setOpenCommentPostId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment.');
    } finally {
      setCommentingPostId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-slate-950 text-slate-400">
        <Loader2 size={20} className="animate-spin text-orange-400" />
        <span className="text-sm">Loading community...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white">Community</h1>
          <p className="mt-1 text-sm text-slate-400">
            Ask questions, share wins, and learn from other Nigerian tech professionals.
          </p>
        </header>

        {error && (
          <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_300px]">
          {/* Left sidebar */}
          <aside>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md lg:sticky lg:top-6">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Sparkles size={13} className="text-orange-400" /> Circles
              </h2>
              <nav className="space-y-1.5">
                {circles.map((circle) => {
                  const Icon = circleIcon(circle.name);
                  const isActive = circle.id === activeCircleId;
                  return (
                    <button
                      key={circle.id}
                      type="button"
                      onClick={() => handleSelectCircle(circle.id)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-orange-500/10 text-orange-300'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-orange-400' : 'text-slate-500'} />
                      <span className="truncate">{circle.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main feed */}
          <main className="min-w-0 space-y-4">
            {/* Composer */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
              <div className="flex gap-3">
                <Avatar name={me?.full_name ?? null} src={me?.avatar_url ?? null} />
                <div className="min-w-0 flex-1">
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder={`Post to ${activeCircle?.name ?? 'the community'}...`}
                    className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-white placeholder-slate-600 focus:border-orange-500/50 focus:outline-none"
                  />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500">{content.length}/500</span>
                    <button
                      type="button"
                      onClick={handlePost}
                      disabled={!content.trim() || !activeCircleId || posting}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      {posting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed */}
            {feedLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 py-12 text-sm text-slate-400 backdrop-blur-md">
                <Loader2 size={18} className="animate-spin text-orange-400" />
                Loading posts...
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 py-12 text-center backdrop-blur-md">
                <p className="text-sm font-medium text-slate-300">No posts in this circle yet.</p>
                <p className="mt-1 text-xs text-slate-500">Be the first to share something.</p>
              </div>
            ) : (
              posts.map((post) => {
                const liked = likedIds.has(post.id);
                return (
                  <article
                    key={post.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={post.authorName} src={post.authorAvatar} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-semibold text-white">{post.authorName}</span>
                          <span className="text-[11px] text-slate-500">· {timeAgo(post.created_at)}</span>
                          {activeCircle && (
                            <span className="ml-auto rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-300">
                              {activeCircle.name}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200">
                          {post.content}
                        </p>
                        <div className="mt-4 flex items-center gap-5">
                          <button
                            type="button"
                            onClick={() => toggleLike(post.id)}
                            aria-pressed={liked}
                            aria-label={liked ? 'Unlike post' : 'Like post'}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                              liked ? 'text-orange-400' : 'text-slate-400 hover:text-orange-300'
                            }`}
                          >
                            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                            {post.likeCount}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenCommentPostId((current) => (current === post.id ? null : post.id))
                            }
                            aria-expanded={openCommentPostId === post.id}
                            aria-label="Comments"
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                              openCommentPostId === post.id
                                ? 'text-orange-400'
                                : 'text-slate-400 hover:text-orange-300'
                            }`}
                          >
                            <MessageCircle size={16} />
                            {post.commentCount}
                          </button>
                        </div>
                        {openCommentPostId === post.id && (
                          <div className="mt-3 space-y-2">
                            {(localComments[post.id] ?? []).map((comment) => (
                              <p
                                key={comment.id}
                                className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-300"
                              >
                                {comment.content}
                              </p>
                            ))}
                            <form
                              onSubmit={(event) => {
                                event.preventDefault();
                                void handleComment(post.id);
                              }}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="text"
                                value={commentDrafts[post.id] ?? ''}
                                onChange={(event) =>
                                  setCommentDrafts((prev) => ({
                                    ...prev,
                                    [post.id]: event.target.value,
                                  }))
                                }
                                placeholder="Write a comment..."
                                className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-orange-500/50"
                              />
                              <button
                                type="submit"
                                disabled={
                                  !(commentDrafts[post.id] ?? '').trim() ||
                                  commentingPostId === post.id
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {commentingPostId === post.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Send size={14} />
                                )}
                                Send
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </main>

          {/* Right sidebar */}
          <aside className="space-y-5 lg:hidden xl:block">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                <TrendingUp size={16} className="text-orange-400" /> Trending Circles
              </h2>
              <div className="mt-4 space-y-2">
                {circles.map((circle) => (
                  <button
                    key={circle.id}
                    type="button"
                    onClick={() => handleSelectCircle(circle.id)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      circle.id === activeCircleId
                        ? 'border-orange-500/30 bg-orange-500/10'
                        : 'border-slate-800 bg-slate-950/40 hover:border-orange-500/20'
                    }`}
                  >
                    <span className="block text-xs font-semibold text-slate-200">{circle.name}</span>
                    {circle.description && (
                      <span className="mt-0.5 block line-clamp-2 text-[11px] text-slate-500">
                        {circle.description}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                <Users size={16} className="text-orange-400" /> Who to follow
              </h2>
              <div className="mt-4 space-y-3">
                {suggested.map((person) => (
                  <div key={person.id} className="flex items-center gap-3">
                    <Avatar name={person.full_name} src={person.avatar_url} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-200">
                        {person.full_name || 'DevCraft Member'}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {person.tech_stack || 'Career explorer'}
                      </p>
                    </div>
                    <Link
                      href="/directory"
                      className="shrink-0 rounded-lg border border-slate-700 px-2 py-1 text-[10px] font-semibold text-slate-300 transition-colors hover:border-orange-500/40 hover:text-orange-300"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
