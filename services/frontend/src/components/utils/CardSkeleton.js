import { VStack, Skeleton } from '@chakra-ui/react';

export default function CardSkeleton() {
    return (
    <VStack gap={4}>
      {[...Array(6)].map((_, index) => ( // Assuming you want 6 skeleton cards
        <Skeleton key={index} w="100%" h="300px" borderRadius="lg" startColor="gray.200" endColor="gray.300" />
      ))}
    </VStack>
    )
};