import { Request, Response, NextFunction } from "express"

interface AuthRequest extends Request {
  user: {
    userId: number
    role: "user" | "admin" | "moderator"
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: 실제 JWT 토큰 검증 로직 구현
  // 임시로 테스트용 사용자 정보 설정
  ;(req as AuthRequest).user = {
    userId: 1,
    role: "user"
  }
  
  next()
}
