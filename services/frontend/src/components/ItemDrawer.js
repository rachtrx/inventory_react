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
import assetService from '../services/AssetService';
import userService from '../services/UserService';
import accessoryService from '../services/AccessoryService';
import Accessory from './accessories/Accessory';


const ItemDrawer = () => {
  
  const { itemsHistory, currentItem, handleBreadcrumbClick, handleClose, isDrawerOpen } = useDrawer()

  useEffect(() => {
    console.log(currentItem);
  }, [currentItem])

  return currentItem && (
    <Drawer isOpen={isDrawerOpen} placement="right" onClose={handleClose} size="lg">
    <DrawerOverlay />
    <DrawerContent>
      <DrawerCloseButton />
      <DrawerHeader>
        <Breadcrumb>
          {itemsHistory.map((item, index) => (
            <BreadcrumbItem key={index} isCurrentPage={item.id === (currentItem?.id)}>
              <BreadcrumbLink onClick={() => handleBreadcrumbClick(item)} cursor="pointer">
                <Text fontSize="sm">{getDisplayValue(item)}</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      </DrawerHeader>
      <DrawerBody p={0}>
        {currentItem?.service?.constructor.name === assetService.constructor.name ? (
          <Asset asset={currentItem} />
        ) : currentItem?.service?.constructor.name === userService.constructor.name ? (
          <User user={currentItem} />
        ) : currentItem?.service?.constructor.name === accessoryService.constructor.name ? (
          <Accessory accType={currentItem} />
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