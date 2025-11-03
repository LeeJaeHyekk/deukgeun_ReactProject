import React, { useState, useEffect } from "react"
import { useAuthRedux } from "../../../frontend/shared/hooks/useAuthRedux"
import "./UserProfilePage.module.css"

interface UserProfileForm {
  nickname: string
  birthDate: string
  gender: "male" | "female" | "other"
  phoneNumber: string
}

function UserProfilePage() {
  const { user, updateUser } = useAuthRedux()
  const [formData, setFormData] = useState<UserProfileForm>({
    nickname: "",
    birthDate: "",
    gender: "male",
    phoneNumber: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || "",
        birthDate: user.birthDate
          ? (typeof user.birthDate === "string" 
              ? new Date(user.birthDate).toISOString().split("T")[0]
              : user.birthDate instanceof Date
                ? user.birthDate.toISOString().split("T")[0]
                : "")
          : "",
        gender: user.gender || "male",
        phoneNumber: user.phone || user.phoneNumber || "", // phone 우선 사용
      })
    }
  }, [user])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      // API 호출하여 사용자 정보 업데이트
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.accessToken}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        updateUser(updatedUser)
        setMessage("프로필이 성공적으로 업데이트되었습니다.")
      } else {
        const error = await response.json()
        setMessage(`업데이트 실패: ${error.message}`)
      }
    } catch (error) {
      setMessage("네트워크 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div>로그인이 필요합니다.</div>
  }

  return (
    <div className="user-profile-page">
      <h1>프로필 설정</h1>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="nickname">닉네임</label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="birthDate">생년월일</label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">성별</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
          >
            <option value="male">남성</option>
            <option value="female">여성</option>
            <option value="other">기타</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">전화번호</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="010-1234-5678"
          />
        </div>

        {message && (
          <div
            className={`message ${message.includes("성공") ? "success" : "error"}`}
          >
            {message}
          </div>
        )}

        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? "업데이트 중..." : "프로필 업데이트"}
        </button>
      </form>
    </div>
  )
}

export default UserProfilePage
