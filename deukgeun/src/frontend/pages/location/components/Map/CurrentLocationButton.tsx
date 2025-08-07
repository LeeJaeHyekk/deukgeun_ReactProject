import React from "react";

interface Props {
  onLocate: (position: { lat: number; lng: number }) => void;
}

export const CurrentLocationButton: React.FC<Props> = ({ onLocate }) => {
  const handleClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onLocate({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (error) => {
          console.error("위치 정보를 가져오지 못했습니다:", error);
        }
      );
    } else {
      console.error("Geolocation을 지원하지 않는 브라우저입니다.");
    }
  };

  return <button onClick={handleClick}>📍 현재 위치로 이동</button>;
};
