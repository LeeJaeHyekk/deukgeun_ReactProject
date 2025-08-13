import { AppDataSource } from "../config/database"

async function checkWorkoutPlanFields() {
  try {
    await AppDataSource.initialize()
    console.log("WorkoutPlan 테이블 구조 확인 중...")

    // 테이블 구조 확인
    const columns = await AppDataSource.query(`
      DESCRIBE workout_plans
    `)

    console.log("현재 workout_plans 테이블 구조:")
    columns.forEach((column: any) => {
      console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Default ? `DEFAULT ${column.Default}` : ''}`)
    })

    console.log("✅ WorkoutPlan 테이블 구조 확인 완료!")
  } catch (error) {
    console.error("테이블 구조 확인 실패:", error)
  } finally {
    await AppDataSource.destroy()
  }
}

checkWorkoutPlanFields()
