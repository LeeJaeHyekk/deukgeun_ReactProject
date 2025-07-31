interface Props {
  onLocate: (position: { lat: number; lng: number }) => void;
}

export const CurrentLocationButton = ({ onLocate }: Props) => {
  const handleClick = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      onLocate({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  };

  return <button onClick={handleClick}>현재 위치로 이동</button>;
};
