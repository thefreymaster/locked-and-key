import { Tag } from "@chakra-ui/react";
import React from "react";
import { useGlobalState } from "../../providers/root";
import { isMobile } from "react-device-detect";

export const CurrentCoordinates = () => {
  const { coordinates, meta } = useGlobalState();
  const { center } = coordinates;
  return (
    <Tag
      padding="1.5"
      backgroundColor="gray.50"
      boxShadow="xs"
      position="absolute"
      top={meta.isInstalled ? "100px" : "80px"}
      zIndex="1000"
      right="none"
      left={isMobile ? 2 : (window.innerWidth - 154) / 2}
    >
      {center?.latitude?.toFixed(5)}, {center?.longitude?.toFixed(5)}
    </Tag>
  );
};
