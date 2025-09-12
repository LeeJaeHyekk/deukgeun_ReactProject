import { AppDataSource } from '../config/database'
import { Post } from '../entities/Post'
import { Comment } from '../entities/Comment'
import { User } from '../entities/User'

async function createTestPosts() {
  try {
    await AppDataSource.initialize()
    console.log('✅ Database connected')

    const userRepo = AppDataSource.getRepository(User)
    const postRepo = AppDataSource.getRepository(Post)
    const commentRepo = AppDataSource.getRepository(Comment)

    // 사용자 조회
    const users = await userRepo.find()
    console.log(`👥 Found ${users.length} users`)

    if (users.length === 0) {
      console.log('❌ No users found. Please run seed script first.')
      return
    }

    const testUser = users[0] // 첫 번째 사용자 사용

    // 테스트 게시글 데이터
    const testPosts = [
      {
        title: '헬스 초보자를 위한 첫 운동 루틴',
        content: `안녕하세요! 헬스를 처음 시작하는 분들을 위해 간단한 운동 루틴을 공유해드려요.

1. 스쿼트 3세트 x 15회
2. 푸시업 3세트 x 10회  
3. 플랭크 3세트 x 30초

꾸준히 하는 것이 가장 중요해요!`,
        category: 'workout' as const,
        tags: ['초보자', '운동루틴', '기초'],
      },
      {
        title: '단백질 섭취 시간 언제가 좋을까요?',
        content: `운동 후 30분 이내에 단백질을 섭취하는 것이 근육 합성에 가장 효과적이라고 들었는데, 정말인가요? 

다른 분들은 언제 단백질을 드시는지 궁금해요. 개인차가 있을 것 같지만 일반적인 가이드라인이 있다면 알고 싶습니다.`,
        category: 'nutrition' as const,
        tags: ['단백질', '영양', '운동후'],
      },
      {
        title: '다이어트 중인데 치팅데이 어떻게 관리하시나요?',
        content: `다이어트를 시작한 지 한 달이 되었는데, 치팅데이를 어떻게 관리해야 할지 모르겠어요.

너무 엄격하게 하면 스트레스가 쌓이고, 너무 자주 하면 다이어트가 안 될 것 같고... 

조언 부탁드려요!`,
        category: 'tips' as const,
        tags: ['다이어트', '치팅데이', '스트레스'],
      },
      {
        title: '운동 후 근육통 완화 방법',
        content: `어제 처음으로 하체 운동을 했는데 오늘 다리가 너무 아파요 😅

운동 후 근육통을 완화하는 좋은 방법이 있을까요? 
- 스트레칭
- 마사지
- 충분한 수분 섭취
- 단백질 섭취

이런 것들 말고 다른 팁이 있다면 공유해주세요!`,
        category: 'tips' as const,
        tags: ['근육통', '회복', '스트레칭'],
      },
      {
        title: '헬스장에서 혼자 운동하기 부담스러워요',
        content: `헬스장에 가면 항상 다른 사람들이 보는 것 같아서 부담스러워요.

특히 새로운 기구를 사용할 때는 더욱 그렇고... 

혼자 운동하시는 분들은 어떻게 하시나요?`,
        category: 'general' as const,
        tags: ['심리', '부담', '혼자운동'],
      },
    ]

    console.log('📝 Creating test posts...')
    const createdPosts = []

    for (const postData of testPosts) {
      const post = postRepo.create({
        title: postData.title,
        content: postData.content,
        author: testUser.nickname,
        category: postData.category,
        tags: postData.tags,
        userId: testUser.id,
        like_count: Math.floor(Math.random() * 10),
        comment_count: 0,
      })

      const savedPost = await postRepo.save(post)
      createdPosts.push(savedPost)
      console.log(`✅ Created post: ${savedPost.title}`)
    }

    // 댓글 생성
    console.log('💬 Creating comments...')
    const sampleComments = [
      '정말 도움이 되는 정보네요! 감사합니다.',
      '저도 비슷한 경험이 있어요. 공감합니다.',
      '좋은 팁 공유해주셔서 고마워요!',
      '따라해보겠습니다. 좋은 하루 되세요!',
      '질문이 있는데, 더 자세히 설명해주실 수 있나요?',
      '이런 정보를 찾고 있었는데 완벽해요!',
      '경험담 공유해주셔서 감사드려요.',
      '저도 시도해보고 후기 남기겠습니다!',
    ]

    for (const post of createdPosts) {
      const commentCount = Math.floor(Math.random() * 3) + 1 // 1-3개 댓글

      for (let i = 0; i < commentCount; i++) {
        const randomComment =
          sampleComments[Math.floor(Math.random() * sampleComments.length)]

        const comment = commentRepo.create({
          postId: post.id,
          userId: testUser.id,
          author: testUser.nickname,
          content: randomComment,
        })

        await commentRepo.save(comment)
        console.log(`💬 Added comment to: ${post.title}`)
      }

      // 댓글 수 업데이트
      const actualCommentCount = await commentRepo.count({
        where: { postId: post.id },
      })
      await postRepo.update(post.id, { comment_count: actualCommentCount })
    }

    console.log(
      `🎉 Successfully created ${createdPosts.length} posts with comments!`
    )
  } catch (error) {
    console.error('❌ Error creating test posts:', error)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  createTestPosts()
}

export { createTestPosts }
