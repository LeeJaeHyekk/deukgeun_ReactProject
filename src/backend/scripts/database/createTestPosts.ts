import { AppDataSource } from "../../shared/database"
import { Post } from "../../domains/community/entities/Post"
import { User } from "../../domains/auth/entities/User"

async function createTestPosts() {
  try {
    await AppDataSource.initialize()
    console.log("Database connected")

    const postRepository = AppDataSource.getRepository(Post)
    const userRepository = AppDataSource.getRepository(User)

    // 테스트 사용자 생성 또는 조회
    let testUser = await userRepository.findOne({
      where: { email: "test@example.com" },
    })

    if (!testUser) {
      testUser = userRepository.create({
        email: "test@example.com",
        password: "hashedpassword",
        nickname: "테스트유저",
        username: "testuser",
      })
      await userRepository.save(testUser)
      console.log("Test user created")
    }

    // 기존 테스트 포스트 삭제
    await postRepository.delete({ userId: testUser.id })
    console.log("Existing test posts deleted")

    // 테스트 포스트 데이터
    const testPosts = [
      {
        title: "초보자를 위한 홈 운동 루틴",
        content:
          "집에서 할 수 있는 간단한 운동들을 소개합니다. 스쿼트, 푸시업, 플랭크 등 기본적인 운동으로 시작해보세요. 하루 30분씩 꾸준히 하면 충분히 효과를 볼 수 있습니다.",
        category: "tips" as const,
        userId: testUser.id,
        author: testUser.nickname,
        like_count: 15,
        comment_count: 8,
      },
      {
        title: "헬스장에서 주의해야 할 에티켓",
        content:
          "헬스장을 이용할 때 지켜야 할 기본적인 에티켓들을 정리해봤습니다. 기구 사용 후 정리하기, 다른 사람이 사용 중일 때 기다리기, 적절한 볼륨으로 음악 듣기 등이 중요합니다.",
        category: "tips" as const,
        userId: testUser.id,
        author: testUser.nickname,
        like_count: 23,
        comment_count: 12,
      },
      {
        title: "체지방률 줄이는 효과적인 다이어트 방법",
        content:
          "단순히 체중만 줄이는 것이 아니라 체지방률을 줄이는 것이 중요합니다. 유산소 운동과 근력 운동을 병행하고, 단백질 섭취를 늘리는 것이 핵심입니다.",
        category: "tips" as const,
        userId: testUser.id,
        author: testUser.nickname,
        like_count: 31,
        comment_count: 19,
      },
      {
        title: "레그 프레스 기구 사용법 가이드",
        content:
          "레그 프레스는 하체 근력을 키우는 데 매우 효과적인 기구입니다. 올바른 자세와 호흡법을 익혀서 안전하게 운동하세요. 무게보다는 정확한 자세가 우선입니다.",
        category: "tips" as const,
        userId: testUser.id,
        author: testUser.nickname,
        like_count: 18,
        comment_count: 6,
      },
      {
        title: "운동 후 회복을 위한 스트레칭",
        content:
          "운동 후 스트레칭은 근육 회복과 유연성 향상에 도움이 됩니다. 각 근육군별로 15-30초씩 천천히 스트레칭하는 것이 좋습니다.",
        category: "tips" as const,
        userId: testUser.id,
        author: testUser.nickname,
        like_count: 27,
        comment_count: 14,
      },
      {
        title: "벌크업을 위한 식단 관리",
        content:
          "근육량을 늘리기 위해서는 단백질 섭취가 중요합니다. 체중 1kg당 1.6-2.2g의 단백질을 섭취하고, 탄수화물과 지방도 적절히 섭취해야 합니다.",
        category: "tips" as const,
        userId: testUser.id,
        author: testUser.nickname,
        like_count: 42,
        comment_count: 25,
      },
      {
        title: "덤벨 운동의 장점과 기본 동작",
        content:
          "덤벨은 자유도가 높고 전신 균형을 발달시키는 데 좋은 도구입니다. 덤벨 스쿼트, 덤벨 로우, 덤벨 프레스 등 기본 동작들을 익혀보세요.",
        category: "tips" as const,
        userId: testUser.id,
        author: testUser.nickname,
        like_count: 16,
        comment_count: 9,
      },
      {
        title: "운동 동기부여를 유지하는 방법",
        content:
          "운동을 꾸준히 하기 위해서는 명확한 목표 설정과 작은 성취감을 느낄 수 있는 방법들이 필요합니다. 운동 일지를 쓰거나 친구와 함께 운동하는 것도 좋은 방법입니다.",
        category: "motivation" as const,
        userId: testUser.id,
        author: testUser.nickname,
        like_count: 35,
        comment_count: 21,
      },
    ]

    // 포스트 생성
    for (const postData of testPosts) {
      const post = postRepository.create(postData)
      await postRepository.save(post)
    }

    console.log(`${testPosts.length}개의 테스트 포스트가 생성되었습니다.`)

    // 생성된 포스트 확인
    const createdPosts = await postRepository.find({
      where: { userId: testUser.id },
      order: { createdAt: "DESC" },
    })

    console.log("생성된 포스트 목록:")
    createdPosts.forEach(post => {
      console.log(
        `- ${post.title} (${post.category}) - 좋아요: ${post.like_count}, 댓글: ${post.comment_count}`
      )
    })
  } catch (error) {
    console.error("Error creating test posts:", error)
  } finally {
    await AppDataSource.destroy()
    console.log("Database connection closed")
  }
}

// 스크립트 실행
createTestPosts()
