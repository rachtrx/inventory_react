import { Button } from '@chakra-ui/react';

export default function ActionButton({ bg, onClick, children }) {
    return (
        <Button bg={bg} onClick={onClick} width="100px">
            {children}
        </Button>
    );
}