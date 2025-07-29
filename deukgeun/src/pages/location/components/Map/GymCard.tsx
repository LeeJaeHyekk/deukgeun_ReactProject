import { Gym } from "../../types/index";

export const GymCard = ({ gym }: { gym: Gym }) => (
  <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
    <h3>{gym.place_name}</h3>
    <p>{gym.address_name}</p>
  </div>
);
