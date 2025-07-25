import "./MachineGuidePage.css";

const machineGuideList = [
  {
    id: 1,
    title: "Chest Press",
    description: "가슴 근육을 강화하는 머신입니다.",
    image: "/img/heroSection_IMG.jpg",
  },
  {
    id: 2,
    title: "Lat Pulldown",
    description: "광배근을 타겟으로 하는 머신입니다.",
    image: "/img/heroSection_IMG.jpg",
  },
  {
    id: 3,
    title: "Leg Press",
    description: "하체 근력 향상을 위한 머신입니다.",
    image: "/img/heroSection_IMG.jpg",
  },
  {
    id: 4,
    title: "Shoulder Press",
    description: "어깨 근육을 강화하는 머신입니다.",
    image: "/img/heroSection_IMG.jpg",
  },
];

export default function MachineGuidePage() {
  return (
    <div className="machineGuidePage">
      <h1 className="machineGuidePage__title">Machine Guide</h1>

      <div className="machineGuidePage__list">
        {machineGuideList.map((item) => (
          <div className="machineGuideCard" key={item.id}>
            <div
              className="machineGuideCard__image"
              style={{ backgroundImage: `url(${item.image})` }}
            ></div>
            <div className="machineGuideCard__info">
              <h2>{item.title}</h2>
              <p className="clickable">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
