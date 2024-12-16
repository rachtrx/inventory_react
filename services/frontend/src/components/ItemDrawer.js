import { 
  DrawerBody,
  DrawerBackdrop,
  DrawerContent,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink, 
  Alert,
  Drawer,
  DrawerHeader,
  Text,
  DrawerCloseTrigger
} from '@chakra-ui/react';
import { useEffect } from 'react';
import Asset from './assets/Asset';
import User from './users/User';
import { useDrawer } from '../context/DrawerProvider';
import { getDisplayValue, itemKeys } from '../config';


const ItemDrawer = () => {
  
  const { itemsHistory, currentItem, handleItemClick, handleClose, drawerOpen } = useDrawer()

  useEffect(() => {
    console.log(currentItem);
  }, [currentItem])

  return (
    <Drawer open={drawerOpen} placement="right" onClose={handleClose} size="lg">
    <DrawerBackdrop />
    <DrawerContent>
      <DrawerCloseTrigger />
      <DrawerHeader>
        <Breadcrumb>
          {itemsHistory.map((item, index) => (
            <BreadcrumbItem key={index} currentPage={item.id === (currentItem?.id)}>
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
          <Alert status="error" title="Data Retrieval Error" borderRadius="md" m="4">
            There was a problem retrieving the data. Please try again later.
          </Alert>
        )}
      </DrawerBody>
    </DrawerContent>
  </Drawer>
  );
};

export default ItemDrawer;