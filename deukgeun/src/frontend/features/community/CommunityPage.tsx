import React, { useEffect, useMemo, useState } from "react";
import { Navigation } from "@widgets/Navigation/Navigation";
import { useAuth } from "@shared/hooks/useAuth";
import { showToast } from "@shared/lib";
import { useNavigate } from "react-router-dom";
import styles from "./CommunityPage.module.css";
import { FeedCard } from "@features/community/components/FeedCard";
import { PostDetailModal } from "@features/community/components/PostDetailModal";
import { postsApi, likesApi } from "@shared/api";

type PostCategory = "운동루틴" | "팁" | "다이어트" | "기구가이드" | "기타";

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  userId: number;
  createdAt: string;
  category: PostCategory;
  tags?: string[];
  thumbnail_url?: string | null;
  images?: string[] | null;
  like_count: number;
  comment_count: number;
}

interface PostListResponse {
  data: Post[];
  total: number;
  page: number;
  limit: number;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | PostCategory
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "운동루틴" as PostCategory,
  });
  const [availableCategories, setAvailableCategories] = useState<
    PostCategory[]
  >(["운동루틴", "팁", "다이어트", "기구가이드", "기타"]);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    // 카테고리 목록 동기화
    postsApi
      .categoriesLive()
      .then((categories) => setAvailableCategories(categories))
      .catch(() => {
        // 실패 시 기본값 사용
        setAvailableCategories([
          "운동루틴",
          "팁",
          "다이어트",
          "기구가이드",
          "기타",
        ]);
      });
  }, [isLoggedIn, navigate]);

  // 서버 정렬/필터 사용
  const sortedPosts = posts;

  const selectedCategoryParam = useMemo(
    () => (selectedCategory === "all" ? undefined : selectedCategory),
    [selectedCategory]
  );

  async function fetchPosts() {
    setIsLoading(true);
    try {
      const res = (await postsApi.list({
        category: selectedCategoryParam as any,
        q: searchTerm || undefined,
        sort: sortBy,
        page,
        limit,
      })) as PostListResponse;
      setPosts(res.data);
      setTotal(res.total);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryParam, searchTerm, sortBy, page, limit]);

  const handleCreatePost = async () => {
    if (!newPost.title.trim()) {
      showToast("제목을 입력해주세요", "error");
      return;
    }
    if (!newPost.content.trim()) {
      showToast("내용을 입력해주세요", "error");
      return;
    }
    if (!user) {
      showToast("로그인이 필요합니다", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await postsApi.create({
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        author: user.nickname,
        // 카테고리는 서버 기본값 사용 (DB 마이그레이션 정합성 확보 전까지 안전 처리)
        tags: [],
        images: [],
        thumbnail_url: null,
      });
      showToast("게시글이 등록되었습니다", "success");
      setShowCreatePost(false);
      setNewPost({
        title: "",
        content: "",
        category: "운동루틴" as PostCategory,
      });
      // 최신 목록 갱신
      await fetchPosts();
    } catch (e) {
      showToast("게시글 등록 중 오류가 발생했습니다", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: number) => {
    const alreadyLiked = likedIds.has(postId);
    try {
      if (alreadyLiked) {
        await likesApi.unlike(postId);
      } else {
        await likesApi.like(postId);
      }
      setLikedIds((prev) => {
        const next = new Set(prev);
        alreadyLiked ? next.delete(postId) : next.add(postId);
        return next;
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, like_count: p.like_count + (alreadyLiked ? -1 : 1) }
            : p
        )
      );
    } catch (e) {
      // 인터셉터에서 에러 토스트 처리
    }
  };

  const handleOpenPost = (post: Post) => setActivePost(post);
  const handleClosePost = () => setActivePost(null);

  if (!isLoggedIn) {
    return null;
  }

  const categories = [
    { id: "all", label: "전체", count: posts.length },
    {
      id: "운동루틴",
      label: "운동루틴",
      count: posts.filter((p) => p.category === "운동루틴").length,
    },
    {
      id: "팁",
      label: "팁",
      count: posts.filter((p) => p.category === "팁").length,
    },
    {
      id: "다이어트",
      label: "다이어트",
      count: posts.filter((p) => p.category === "다이어트").length,
    },
    {
      id: "기구가이드",
      label: "기구가이드",
      count: posts.filter((p) => p.category === "기구가이드").length,
    },
  ];

  return (
    <div className={styles.communityPage}>
      <Navigation />

      <div className={styles.container}>
        {/* 헤더 */}
        <header className={styles.header}>
          <h1>커뮤니티</h1>
          <p>운동 동료들과 정보를 공유하고 소통해보세요</p>
        </header>

        {/* 컨트롤 섹션 */}
        <section className={styles.controls}>
          {/* 검색 및 정렬 */}
          <div className={styles.searchSort}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="게시글 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.sortSelect}>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "latest" | "popular")
                }
                className={styles.select}
              >
                <option value="latest">최신순</option>
                <option value="popular">인기순</option>
              </select>
            </div>
          </div>

          {/* 카테고리 + 글쓰기 동일 구역 배치 */}
          <div className={styles.categoriesRow}>
            <div className={styles.categories}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`${styles.categoryBtn} ${
                    selectedCategory === category.id ? styles.active : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory(category.id as PostCategory | "all");
                    setPage(1);
                  }}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>

            <button
              className={styles.createPostBtn}
              onClick={() => setShowCreatePost(true)}
            >
              ✏️ 글쓰기
            </button>
          </div>
        </section>

        {/* 게시글 목록 */}
        <section className={styles.postsSection}>
          {sortedPosts.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>게시글이 없습니다</h3>
              <p>첫 번째 게시글을 작성해보세요!</p>
            </div>
          ) : (
            <div className={styles.postsGrid}>
              {sortedPosts.map((post) => (
                <FeedCard
                  key={post.id}
                  post={{
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    author: post.author,
                    authorAvatar: "/img/user-avatar.png",
                    createdAt: new Date(post.createdAt)
                      .toISOString()
                      .split("T")[0],
                    likes: post.like_count,
                    comments: post.comment_count,
                    category: post.category,
                    tags: post.tags || [],
                  }}
                  onClick={() => setActivePost(post)}
                  onLike={() => handleLike(post.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 글쓰기 모달 */}
      {showCreatePost && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowCreatePost(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>새 게시글 작성</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowCreatePost(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalContent}>
              <select
                value={newPost.category}
                onChange={(e) =>
                  setNewPost({
                    ...newPost,
                    category: e.target.value as PostCategory,
                  })
                }
                className={styles.categorySelect}
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
                className={styles.titleInput}
              />

              <textarea
                placeholder="내용을 입력하세요"
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
                className={styles.contentInput}
                rows={6}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowCreatePost(false)}
              >
                취소
              </button>
              <button
                className={styles.submitBtn}
                onClick={handleCreatePost}
                disabled={isSubmitting}
              >
                작성하기
              </button>
            </div>
          </div>
        </div>
      )}

      {activePost && (
        <PostDetailModal
          post={{
            id: activePost.id,
            title: activePost.title,
            content: activePost.content,
            author: activePost.author,
            authorAvatar: "/img/user-avatar.png",
            createdAt: new Date(activePost.createdAt)
              .toISOString()
              .split("T")[0],
            category: activePost.category,
            tags: activePost.tags || [],
            likes: activePost.like_count,
            comments: activePost.comment_count,
          }}
          onClose={handleClosePost}
        />
      )}
    </div>
  );
}
