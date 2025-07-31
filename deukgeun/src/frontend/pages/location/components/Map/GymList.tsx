import { Gym } from "../../types/index";
import { GymCard } from "./GymCard";

interface Props {
  gyms: Gym[];
}

export const GymList = ({ gyms }: Props) => (
  <div>
    {gyms.map((gym) => (
      <GymCard key={gym.id} gym={gym} />
    ))}
  </div>
);
