import React from "react";
import { Spinner } from "@chakra-ui/react";
import { useLoading } from "../context/LoadingProvider"; // Now using separate loading context

const LoadingSpinner = () => {
  const { loading } = useLoading(); // Access loading state

  if (!loading) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "rgba(0, 0, 0, 0.3)", // Adjust opacity here
        backdropFilter: "blur(5px)", // Optional blur effect
        zIndex: 9999,
      }}
    >
      <Spinner thickness="4px" speed="0.65s" emptyColor="bgGray" color="bgBlue" size="xl" />
    </div>
  );
};

export default LoadingSpinner;