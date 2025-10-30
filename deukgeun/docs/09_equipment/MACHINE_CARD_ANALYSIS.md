# 기구 가이드 카드 생성 분석

## 📊 현재 이미지 파일 현황

### 총 29개 이미지 파일
```
barbell.png
bench-press.png
bicep-curl.png
cable-machine.png
chest-press.png
chin-up-dip-station.png
chin-up.png
default.png (제외)
dumbbell.png
ground-base-combo-incline.png
kneeling-leg-curl.png
lat-pulldown.png
lateral-pulldown.png
leg-curl.png
leg-extension.png
leg-press.png
overhead-press.png
plate-loaded-leg-press.png
plate-loaded-squat.png
plate-loaded-wide-pulldown.png
rowing.png
seated-row.png
selectorized-lat-pulldown.png
selectorized-leg-curl.png
shoulder-press.png
side-lateral-raise.png
squat-rack.png
treadmill.png
tricep-extension.png
```

### 중복 제거 후 28개 (default.png 제외)

## 🎯 기구 카드 생성에 필요한 정보

### 필수 정보 (MachineDTO 기준)
1. **id** - 고유 식별자
2. **machineKey** - 기구 키 (예: "barbell-001")
3. **name** - 기구명 (영어)
4. **nameKo** - 기구명 (한국어)
5. **imageUrl** - 이미지 URL
6. **shortDesc** - 짧은 설명
7. **detailDesc** - 상세 설명
8. **category** - 카테고리
9. **difficulty** - 난이도
10. **isActive** - 활성 상태

### 선택 정보
11. **targetMuscles** - 타겟 근육
12. **positiveEffect** - 긍정적 효과
13. **instructions** - 사용법
14. **videoUrl** - 동영상 URL

## 📋 각 기구별 필요한 정보 매핑

### 1. 바벨 (barbell.png)
- **name**: "Barbell"
- **nameKo**: "바벨"
- **category**: "strength"
- **difficulty**: "beginner"
- **targetMuscles**: ["전신", "상체", "하체"]
- **shortDesc**: "다양한 근력 운동에 사용되는 기본 기구"
- **detailDesc**: "바벨은 근력 운동의 기본이 되는 기구로, 다양한 근육군을 단련할 수 있습니다."

### 2. 벤치프레스 (bench-press.png)
- **name**: "Bench Press"
- **nameKo**: "벤치프레스"
- **category**: "strength"
- **difficulty**: "intermediate"
- **targetMuscles**: ["가슴", "어깨", "삼두근"]
- **shortDesc**: "가슴 근육을 집중적으로 단련하는 운동"
- **detailDesc**: "벤치프레스는 가슴 근육을 집중적으로 단련하는 대표적인 운동입니다."

### 3. 바이셉 컬 (bicep-curl.png)
- **name**: "Bicep Curl"
- **nameKo**: "바이셉 컬"
- **category**: "strength"
- **difficulty**: "beginner"
- **targetMuscles**: ["이두근", "전완근"]
- **shortDesc**: "이두근을 집중적으로 단련하는 운동"
- **detailDesc**: "바이셉 컬은 이두근을 집중적으로 단련하는 운동입니다."

### 4. 케이블 머신 (cable-machine.png)
- **name**: "Cable Machine"
- **nameKo**: "케이블 머신"
- **category**: "strength"
- **difficulty**: "beginner"
- **targetMuscles**: ["전신"]
- **shortDesc**: "다양한 각도에서 근력 운동이 가능한 기구"
- **detailDesc**: "케이블 머신은 다양한 각도에서 근력 운동이 가능한 다목적 기구입니다."

### 5. 체스트 프레스 (chest-press.png)
- **name**: "Chest Press"
- **nameKo**: "체스트 프레스"
- **category**: "strength"
- **difficulty**: "beginner"
- **targetMuscles**: ["가슴", "어깨", "삼두근"]
- **shortDesc**: "가슴 근육을 단련하는 머신 운동"
- **detailDesc**: "체스트 프레스는 가슴 근육을 단련하는 머신 운동입니다."

### 6. 풀업 딥스 스테이션 (chin-up-dip-station.png)
- **name**: "Chin-up Dip Station"
- **nameKo**: "풀업 딥스 스테이션"
- **category**: "strength"
- **difficulty**: "intermediate"
- **targetMuscles**: ["등", "삼두근", "이두근"]
- **shortDesc**: "풀업과 딥스를 할 수 있는 복합 기구"
- **detailDesc**: "풀업과 딥스를 할 수 있는 복합 기구입니다."

### 7. 풀업 (chin-up.png)
- **name**: "Chin-up"
- **nameKo**: "풀업"
- **category**: "strength"
- **difficulty**: "intermediate"
- **targetMuscles**: ["등", "이두근"]
- **shortDesc**: "등과 이두근을 단련하는 운동"
- **detailDesc**: "풀업은 등과 이두근을 단련하는 운동입니다."

### 8. 덤벨 (dumbbell.png)
- **name**: "Dumbbell"
- **nameKo**: "덤벨"
- **category**: "strength"
- **difficulty**: "beginner"
- **targetMuscles**: ["전신"]
- **shortDesc**: "다양한 근력 운동에 사용되는 기본 기구"
- **detailDesc**: "덤벨은 다양한 근력 운동에 사용되는 기본 기구입니다."

### 9. 그라운드 베이스 콤보 인클라인 (ground-base-combo-incline.png)
- **name**: "Ground Base Combo Incline"
- **nameKo**: "그라운드 베이스 콤보 인클라인"
- **category**: "strength"
- **difficulty**: "advanced"
- **targetMuscles**: ["전신"]
- **shortDesc**: "다양한 각도에서 운동이 가능한 복합 기구"
- **detailDesc**: "그라운드 베이스 콤보 인클라인은 다양한 각도에서 운동이 가능한 복합 기구입니다."

### 10. 니링 레그 컬 (kneeling-leg-curl.png)
- **name**: "Kneeling Leg Curl"
- **nameKo**: "니링 레그 컬"
- **category**: "strength"
- **difficulty**: "intermediate"
- **targetMuscles**: ["햄스트링", "종아리"]
- **shortDesc**: "햄스트링을 집중적으로 단련하는 운동"
- **detailDesc**: "니링 레그 컬은 햄스트링을 집중적으로 단련하는 운동입니다."

### 11. 랫 풀다운 (lat-pulldown.png)
- **name**: "Lat Pulldown"
- **nameKo**: "랫 풀다운"
- **category**: "strength"
- **difficulty**: "beginner"
- **targetMuscles**: ["등", "이두근"]
- **shortDesc**: "등 근육을 단련하는 머신 운동"
- **detailDesc**: "랫 풀다운은 등 근육을 단련하는 머신 운동입니다."

### 12. 레터럴 풀다운 (lateral-pulldown.png)
- **name**: "Lateral Pulldown"
- **nameKo**: "레터럴 풀다운"
- **category**: "strength"
- **difficulty**: "beginner"
- **targetMuscles**: ["등", "이두근"]
- **shortDesc**: "등 근육을 단련하는 머신 운동"
- **detailDesc**: "레터럴 풀다운은 등 근육을 단련하는 머신 운동입니다."

### 13. 레그 컬 (leg-curl.png)
- **name**: "Leg Curl"
- **nameKo**: "레그 컬"
- **category**: "strength"
- **difficulty**: "beginner"
- **targetMuscles**: ["햄스트링"]
- **shortDesc**: "햄스트링을 단련하는 머신 운동"
- **detailDesc**: "레그 컬은 햄스트링을 단련하는 머신 운동입니다."

### 14. 레그 익스텐션 (leg-extension.png)
- **name**: "Leg Extension"
- **nameKo**: "레그 익스텐션"
- **category**: "strength"
- **difficulty**: "beginner"
- **targetMuscles**: ["대퇴사두근"]
- **shortDesc**: "대퇴사두근을 단련하는 머신 운동"
- **detailDesc**: "레그 익스텐션은 대퇴사두근을 단련하는 머신 운동입니다."

### 15. 레그 프레스 (leg-press.png)
- **name**: "Leg Press"
- **nameKo**: "레그 프레스"
- **category**: "strength"
- **difficulty**: "beginner"
- **targetMuscles**: ["대퇴사두근", "햄스트링", "둔근"]
- **shortDesc**: "하체 근육을 단련하는 머신 운동"
- **detailDesc**: "레그 프레스는 하체 근육을 단련하는 머신 운동입니다."

### 16. 오버헤드 프레스 (overhead-press.png)
- **name**: "Overhead Press"
- **nameKo**: "오버헤드 프레스"
- **category**: "strength"
- **difficulty**: "intermediate"
- **targetMuscles**: ["어깨", "삼두근", "코어"]
- **shortDesc**: "어깨 근육을 단련하는 운동"
- **detailDesc**: "오버헤드 프레스는 어깨 근육을 단련하는 운동입니다."

### 17. 플레이트 로디드 레그 프레스 (plate-loaded-leg-press.png)
- **name**: "Plate Loaded Leg Press"
- **nameKo**: "플레이트 로디드 레그 프레스"
- **category**: "strength"
- **difficulty**: "intermediate"
- **targetMuscles**: ["대퇴사두근", "햄스트링", "둔근"]
- **shortDesc**: "플레이트를 이용한 하체 근육 단련"
- **detailDesc**: "플레이트 로디드 레그 프레스는 플레이트를 이용한 하체 근육 단련 기구입니다."

### 18. 플레이트 로디드 스쿼트 (plate-loaded-squat.png)
- **name**: "Plate Loaded Squat"
- **nameKo**: "플레이트 로디드 스쿼트"
- **category**: "strength"
- **difficulty**: "intermediate"
- **targetMuscles**: ["대퇴사두근", "햄스트링", "둔근", "코어"]
- **shortDesc**: "플레이트를 이용한 스쿼트 운동"
- **detailDesc**: "플레이트 로디드 스쿼트는 플레이트를 이용한 스쿼트 운동 기구입니다."

### 19. 플레이트 로디드 와이드 풀다운 (plate-loaded-wide-pulldown.png)
- **name**: "Plate Loaded Wide Pulldown"
- **nameKo**: "플레이트 로디드 와이드 풀다운"
- **category**: "strength"
- **difficulty**: "intermediate"
- **targetMuscles**: ["등", "이두근"]
- **shortDesc**: "플레이트를 이용한 등 근육 단련"
- **detailDesc**: "플레이트 로디드 와이드 풀다운은 플레이트를 이용한 등 근육 단련 기구입니다."

### 20. 로잉 머신 (rowing.png) ⭐
- **name**: "Rowing Machine"
- **nameKo**: "로잉 머신"
- **category**: "cardio"
- **difficulty**: "beginner"
- **targetMuscles**: ["전신", "등", "어깨", "하체"]
- **shortDesc**: "전신 근력과 심폐 기능을 동시에 단련하는 기구"
- **detailDesc**: "로잉 머신은 전신 근력과 심폐 기능을 동시에 단련하는 기구입니다."

### 21. 시티드 로우 (seated-row.png)
- **name**: "Seated Row"
- **nameKo**: "시티드 로우"
- **category**: "strength"
- **difficulty**: "beginner"
- **targetMuscles**: ["등", "이두근"]
- **shortDesc**: "등 근육을 단련하는 머신 운동"
- **detailDesc**: "시티드 로우는 등 근육을 단련하는 머신 운동입니다."

### 22. 셀렉터라이즈드 랫 풀다운 (selectorized-lat-pulldown.png)
- **name**: "Selectorized Lat Pulldown"
- **nameKo**: "셀렉터라이즈드 랫 풀다운"
- **category**: "strength"
- **difficulty**: "beginner"
- **targetMuscles**: ["등", "이두근"]
- **shortDesc**: "셀렉터를 이용한 등 근육 단련"
- **detailDesc**: "셀렉터라이즈드 랫 풀다운은 셀렉터를 이용한 등 근육 단련 기구입니다."

### 23. 셀렉터라이즈드 레그 컬 (selectorized-leg-curl.png)
- **name**: "Selectorized Leg Curl"
- **nameKo**: "셀렉터라이즈드 레그 컬"
- **category**: "strength"
- **difficulty**: "beginner"
- **targetMuscles**: ["햄스트링"]
- **shortDesc**: "셀렉터를 이용한 햄스트링 단련"
- **detailDesc**: "셀렉터라이즈드 레그 컬은 셀렉터를 이용한 햄스트링 단련 기구입니다."

### 24. 숄더 프레스 (shoulder-press.png)
- **name**: "Shoulder Press"
- **nameKo**: "숄더 프레스"
- **category**: "strength"
- **difficulty**: "beginner"
- **targetMuscles**: ["어깨", "삼두근"]
- **shortDesc**: "어깨 근육을 단련하는 머신 운동"
- **detailDesc**: "숄더 프레스는 어깨 근육을 단련하는 머신 운동입니다."

### 25. 사이드 레터럴 레이즈 (side-lateral-raise.png)
- **name**: "Side Lateral Raise"
- **nameKo**: "사이드 레터럴 레이즈"
- **category**: "strength"
- **difficulty**: "beginner"
- **targetMuscles**: ["어깨"]
- **shortDesc**: "어깨 측면 근육을 단련하는 운동"
- **detailDesc**: "사이드 레터럴 레이즈는 어깨 측면 근육을 단련하는 운동입니다."

### 26. 스쿼트 랙 (squat-rack.png)
- **name**: "Squat Rack"
- **nameKo**: "스쿼트 랙"
- **category**: "strength"
- **difficulty**: "intermediate"
- **targetMuscles**: ["대퇴사두근", "햄스트링", "둔근", "코어"]
- **shortDesc**: "스쿼트 운동을 위한 안전한 기구"
- **detailDesc**: "스쿼트 랙은 스쿼트 운동을 위한 안전한 기구입니다."

### 27. 런닝머신 (treadmill.png)
- **name**: "Treadmill"
- **nameKo**: "런닝머신"
- **category**: "cardio"
- **difficulty**: "beginner"
- **targetMuscles**: ["하체", "심폐기능"]
- **shortDesc**: "유산소 운동을 위한 기본 기구"
- **detailDesc**: "런닝머신은 유산소 운동을 위한 기본 기구입니다."

### 28. 트라이셉 익스텐션 (tricep-extension.png)
- **name**: "Tricep Extension"
- **nameKo**: "트라이셉 익스텐션"
- **category**: "strength"
- **difficulty**: "beginner"
- **targetMuscles**: ["삼두근"]
- **shortDesc**: "삼두근을 집중적으로 단련하는 운동"
- **detailDesc**: "트라이셉 익스텐션은 삼두근을 집중적으로 단련하는 운동입니다."

## ❌ 부족한 정보

### 1. 고유 식별자
- **id**: 각 기구마다 고유한 숫자 ID 필요
- **machineKey**: 각 기구마다 고유한 문자열 키 필요

### 2. 상세 설명
- **detailDesc**: 각 기구의 상세한 사용법과 효과 설명 필요

### 3. 사용법
- **instructions**: 각 기구의 단계별 사용법 배열 필요

### 4. 긍정적 효과
- **positiveEffect**: 각 기구의 구체적인 운동 효과 설명 필요

### 5. 동영상 URL
- **videoUrl**: 각 기구의 사용법 동영상 URL 필요

### 6. 이미지 메타데이터
- **imageMetadata**: 각 이미지의 크기, 형식, 수정일 등 정보 필요

## 🎯 다음 단계

1. **고유 식별자 생성**: 각 기구마다 고유한 ID와 machineKey 생성
2. **상세 정보 작성**: 각 기구의 상세 설명, 사용법, 효과 등 작성
3. **데이터베이스 입력**: 생성된 정보를 데이터베이스에 입력
4. **테스트**: 생성된 기구 카드들이 올바르게 표시되는지 확인
