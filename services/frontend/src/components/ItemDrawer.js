import { 
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink } from '@chakra-ui/react';
import { useEffect } from 'react';
import Asset from './assets/Asset';
import { useDrawer } from '../context/ItemProvider';
import User from './users/User';


const ItemDrawer = () => {
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { itemsHistory, currentItem, resetBreadcrumbs, handleItemClick } = useDrawer()

  const handleClose = () => {
    onDrawerClose();
    resetBreadcrumbs();
  };

  useEffect(() => {
    if (currentItem && !isDrawerOpen) onDrawerOpen();
  }, [currentItem, onDrawerOpen, isDrawerOpen]);

  return (
    <Drawer isOpen={isDrawerOpen} placement="right" onClose={handleClose} size="lg">
        <DrawerOverlay />
        <Breadcrumb>
          {itemsHistory.map((item, index) => (
            <BreadcrumbItem key={index} isCurrentPage={item.id === (currentItem?.id)}>
              <BreadcrumbLink onClick={() => handleItemClick(item)}>
                {item.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
        <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody p={0}>
              {currentItem.userName ? 
              <User user={currentItem} /> : <Asset asset={currentItem} />}
            </DrawerBody>
        </DrawerContent>
    </Drawer>
  );
};

export default ItemDrawer;