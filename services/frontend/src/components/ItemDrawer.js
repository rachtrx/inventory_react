import { 
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink, 
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Drawer,
  DrawerHeader,
  Text} from '@chakra-ui/react';
import { useEffect } from 'react';
import Asset from './assets/Asset';
import User from './users/User';
import { useDrawer } from '../context/DrawerProvider';
import { getDisplayValue, itemKeys } from '../config';


const ItemDrawer = () => {
  
  const { itemsHistory, currentItem, handleItemClick, handleClose, isDrawerOpen } = useDrawer()

  useEffect(() => {
    console.log(currentItem);
  }, [currentItem])

  return (
    <Drawer isOpen={isDrawerOpen} placement="right" onClose={handleClose} size="lg">
    <DrawerOverlay />
    <DrawerContent>
      <DrawerCloseButton />
      <DrawerHeader>
        <Breadcrumb>
          {itemsHistory.map((item, index) => (
            <BreadcrumbItem key={index} isCurrentPage={item.id === (currentItem?.id)}>
              <BreadcrumbLink onClick={() => handleItemClick(item)}>
                <Text fontSize="sm">{getDisplayValue(item)}</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      </DrawerHeader>
      <DrawerBody p={0}>
        {currentItem && currentItem.assetTag ? (
          <Asset asset={currentItem} />
        ) : currentItem ? (
          <User user={currentItem} />
        ) : (
          <Alert status="error" borderRadius="md" m="4">
            <AlertIcon />
            <AlertTitle mr={2}>Data Retrieval Error</AlertTitle>
            <AlertDescription>There was a problem retrieving the data. Please try again later.</AlertDescription>
          </Alert>
        )}
      </DrawerBody>
    </DrawerContent>
  </Drawer>
  );
};

export default ItemDrawer;