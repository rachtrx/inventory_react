import React from "react";
import { Spinner } from "@chakra-ui/react";
import { useLoading } from "../context/LoadingProvider"; // Now using separate loading context

const LoadingSpinner = () => {
  const { loading } = useLoading(); // Access loading state

  if (!loading) return null;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
    </div>
  );
};

export default LoadingSpinner;