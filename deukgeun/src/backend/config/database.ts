// import { createConnection } from "typeorm";
// import { config } from "./env";
// import { Post } from "../entities/Post";
// import { Gym } from "../entities/Gym";

// /**
//  * TypeORM 데이터베이스 연결 설정
//  * MySQL 데이터베이스와의 연결을 위한 DataSource를 생성합니다.
//  * 환경 변수를 통해 데이터베이스 접속 정보를 관리합니다.
//  */
// export const connectDatabase = async () =>
//   return await createConnection({
//     // 데이터베이스 타입 설정
//     type: "mysql",

//     // 데이터베이스 호스트 주소
//     host: config.DB_HOST,

//     // 데이터베이스 포트 번호
//     port: config.DB_PORT,

//     // 데이터베이스 사용자명
//     username: config.DB_USERNAME,

//     // 데이터베이스 비밀번호
//     password: config.DB_PASSWORD,

//     // 데이터베이스 이름
//     database: config.DB_NAME,

//     // 개발환경에서만 스키마 자동 동기화 활성화
//     // 프로덕션에서는 false로 설정하여 데이터 손실을 방지합니다.
//     synchronize: config.NODE_ENV === "development",

//     // 개발환경에서만 SQL 쿼리 로깅 활성화
//     // 디버깅 목적으로 사용됩니다.
//     logging: config.NODE_ENV === "development",

//     // 엔티티 클래스 목록
//     // TypeORM이 관리할 데이터베이스 테이블과 매핑되는 클래스들입니다.
//     entities: [Post, Gym],

//     // 구독자 목록 (현재 사용하지 않음)
//     subscribers: [],

//     // 마이그레이션 목록 (현재 사용하지 않음)
//     migrations: [],
//   });
// };

import { createConnection } from "typeorm";
import { config } from "./env";
import { Post } from "../entities/Post";
import { Gym } from "../entities/Gym";

/**
 * TypeORM 데이터베이스 연결 설정
 * MySQL 데이터베이스와의 연결을 위한 DataSource를 생성합니다.
 * 환경 변수를 통해 데이터베이스 접속 정보를 관리합니다.
 */
export const connectDatabase = async () => {
  try {
    const connection = await createConnection({
      // 데이터베이스 타입 설정
      type: "mysql",

      // 데이터베이스 호스트 주소
      host: config.DB_HOST,

      // 데이터베이스 포트 번호
      port: config.DB_PORT,

      // 데이터베이스 사용자명
      username: config.DB_USERNAME,

      // 데이터베이스 비밀번호
      password: config.DB_PASSWORD,

      // 데이터베이스 이름
      database: config.DB_NAME,

      // 개발환경에서만 스키마 자동 동기화 활성화
      // 프로덕션에서는 false로 설정하여 데이터 손실을 방지합니다.
      synchronize: config.NODE_ENV === "development",

      // 개발환경에서만 SQL 쿼리 로깅 활성화
      // 디버깅 목적으로 사용됩니다.
      logging: config.NODE_ENV === "development",

      // 엔티티 클래스 목록
      // TypeORM이 관리할 데이터베이스 테이블과 매핑되는 클래스들입니다.
      entities: [Post, Gym],

      // 구독자 목록 (현재 사용하지 않음)
      subscribers: [],

      // 마이그레이션 목록 (현재 사용하지 않음)
      migrations: [],
    });
    console.log("Database connected successfully!");
    return connection; // Return the established connection object
  } catch (error) {
    console.error("Database connection error:", error);
    throw error; // Re-throw the error to ensure calling code knows about the failure
  }
};
