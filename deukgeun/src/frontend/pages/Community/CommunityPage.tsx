import React, { useState, useEffect } from "react";
import { Navigation } from "@widgets/Navigation/Navigation";
import { useAuth } from "@shared/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import styles from "./CommunityPage.module.css";

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
  likes: number;
  comments: number;
  category: string;
  tags: string[];
}

interface Comment {
  id: number;
  content: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
}

const mockPosts: Post[] = [
  {
    id: 1,
    title: "오늘 가슴 운동 루틴 공유합니다!",
    content:
      "벤치프레스 3세트, 인클라인 덤벨프레스 3세트, 딥스 3세트로 구성했습니다. 특히 인클라인 덤벨프레스에서 상부 가슴 자극을 많이 느꼈어요!",
    author: "운동하는김씨",
    authorAvatar: "/img/user-avatar.png",
    createdAt: "2025-01-15",
    likes: 24,
    comments: 8,
    category: "운동루틴",
    tags: ["가슴운동", "벤치프레스", "상체"],
  },
  {
    id: 2,
    title: "헬스장에서 자주 보는 실수들",
    content:
      "새로 오신 분들을 위해 자주 보이는 실수들을 정리해봤습니다. 1. 워밍업 부족 2. 자세 무시 3. 무게에만 집중...",
    author: "헬스장선생님",
    authorAvatar: "/img/user-avatar.png",
    createdAt: "2025-01-14",
    likes: 156,
    comments: 32,
    category: "팁",
    tags: ["초보자", "자세", "안전"],
  },
  {
    id: 3,
    title: "다이어트 식단 공유 (3개월 -10kg)",
    content:
      "3개월간 꾸준히 다이어트한 결과 -10kg 감량에 성공했습니다! 주요 포인트는 단백질 섭취량 유지와 탄수화물 조절이었어요.",
    author: "다이어터",
    authorAvatar: "/img/user-avatar.png",
    createdAt: "2025-01-13",
    likes: 89,
    comments: 15,
    category: "다이어트",
    tags: ["다이어트", "식단", "감량"],
  },
  {
    id: 4,
    title: "새로운 헬스장 기구 사용법",
    content:
      "최근에 설치된 새로운 기구의 올바른 사용법을 알아보았습니다. 특히 어깨 운동에 효과적인 것 같아요!",
    author: "기구탐험가",
    authorAvatar: "/img/user-avatar.png",
    createdAt: "2025-01-12",
    likes: 67,
    comments: 12,
    category: "기구가이드",
    tags: ["새기구", "어깨운동", "가이드"],
  },
];

const categories = [
  { id: "all", label: "전체", count: mockPosts.length },
  {
    id: "운동루틴",
    label: "운동루틴",
    count: mockPosts.filter((p) => p.category === "운동루틴").length,
  },
  {
    id: "팁",
    label: "팁",
    count: mockPosts.filter((p) => p.category === "팁").length,
  },
  {
    id: "다이어트",
    label: "다이어트",
    count: mockPosts.filter((p) => p.category === "다이어트").length,
  },
  {
    id: "기구가이드",
    label: "기구가이드",
    count: mockPosts.filter((p) => p.category === "기구가이드").length,
  },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "운동루틴",
  });

  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
  }, [isLoggedIn, navigate]);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return b.likes - a.likes;
    }
  });

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    const post: Post = {
      id: posts.length + 1,
      title: newPost.title,
      content: newPost.content,
      author: "나",
      authorAvatar: "/img/user-avatar.png",
      createdAt: new Date().toISOString().split("T")[0],
      likes: 0,
      comments: 0,
      category: newPost.category,
      tags: [],
    };

    setPosts([post, ...posts]);
    setNewPost({ title: "", content: "", category: "운동루틴" });
    setShowCreatePost(false);
  };

  const handleLike = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  if (!isLoggedIn) {
    return null;
  }

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

          {/* 카테고리 필터 */}
          <div className={styles.categories}>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryBtn} ${
                  selectedCategory === category.id ? styles.active : ""
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>

          {/* 글쓰기 버튼 */}
          <button
            className={styles.createPostBtn}
            onClick={() => setShowCreatePost(true)}
          >
            ✏️ 글쓰기
          </button>
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
                <article key={post.id} className={styles.postCard}>
                  <div className={styles.postHeader}>
                    <div className={styles.authorInfo}>
                      <img
                        src={post.authorAvatar}
                        alt={post.author}
                        className={styles.authorAvatar}
                      />
                      <div>
                        <span className={styles.authorName}>{post.author}</span>
                        <span className={styles.postDate}>
                          {post.createdAt}
                        </span>
                      </div>
                    </div>
                    <span className={styles.category}>{post.category}</span>
                  </div>

                  <div className={styles.postContent}>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    <p className={styles.postExcerpt}>
                      {post.content.length > 100
                        ? `${post.content.substring(0, 100)}...`
                        : post.content}
                    </p>
                  </div>

                  <div className={styles.postTags}>
                    {post.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className={styles.postActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleLike(post.id)}
                    >
                      ❤️ {post.likes}
                    </button>
                    <button className={styles.actionBtn}>
                      💬 {post.comments}
                    </button>
                    <button className={styles.actionBtn}>📤 공유</button>
                  </div>
                </article>
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
                  setNewPost({ ...newPost, category: e.target.value })
                }
                className={styles.categorySelect}
              >
                <option value="운동루틴">운동루틴</option>
                <option value="팁">팁</option>
                <option value="다이어트">다이어트</option>
                <option value="기구가이드">기구가이드</option>
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
              <button className={styles.submitBtn} onClick={handleCreatePost}>
                작성하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
