import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Box,
    Divider
} from '@chakra-ui/react';
import { useCallback, useEffect } from 'react';
import { Form, Formik } from 'formik';
import { actionTypes, useFormModal, FormType } from '../context/ModalProvider';
import { ResponsiveText } from './utils/ResponsiveText';
import { LoansProvider } from './forms/loan/LoansProvider';
import { ReturnsProvider } from './forms/return/ReturnsProvider';
import { AddAssetsProvider } from './forms/asset/addAsset/AddAssetsProvider';
import { AddUsersProvider } from './forms/user/addUser/AddUsersProvider';
import { DelAssetsProvider } from './forms/asset/delAsset/DelAssetsProvider';
import { DelUsersProvider } from './forms/user/delUser/DelUsersProvider';
import UpdateAccessories from './forms/accessories/updateAcc/UpdateAccessories';
import { AddAssetTagsProvider, DelAssetTagsProvider } from './forms/asset/tags/AssetTagsProvider';
import { AddUserTagsProvider, DelUserTagsProvider } from './forms/user/tags/UserTagsProvider';
// import { createDelTagsProvider } from './forms/asset/addTag/createDelTagsProvider';

const formMap = {
    [FormType.ADD_ASSET]: <AddAssetsProvider/>,
    [FormType.LOAN]: <LoansProvider/>,
    [FormType.RETURN]: <ReturnsProvider/>,
    [FormType.DEL_ASSET]: <DelAssetsProvider/>,
    [FormType.ADD_USER]: <AddUsersProvider/>,
    [FormType.DEL_USER]: <DelUsersProvider/>,
    [FormType.UPDATE_ACC]: <UpdateAccessories/>,
    [FormType.TAG_ASSET]: <AddAssetTagsProvider/>,
    [FormType.UNTAG_ASSET]: <DelAssetTagsProvider/>,
    [FormType.TAG_USER]: <AddUserTagsProvider/>,
    [FormType.UNTAG_USER]: <DelUserTagsProvider/>,
}

const headerMap = {
    [FormType.ADD_ASSET]: "Add Asset",
    [FormType.LOAN]: 'Loan',
    [FormType.RETURN]: 'Return',
    [FormType.DEL_ASSET]: "Condemn Asset",
    [FormType.ADD_USER]: "Add User",
    [FormType.DEL_USER]: "Remove User",
    [FormType.UPDATE_ACC]: "Update Accessory",
    [FormType.TAG_ASSET]: "Tag Assets",
    [FormType.UNTAG_ASSET]: "UnTag Assets",
    [FormType.TAG_USER]: "Tag Users",
    [FormType.UNTAG_USER]: "UnTag Users",
}

export default function FormModal() { 

    const { setFormType, formType, isModalOpen, onModalOpen, onModalClose } = useFormModal();

    useEffect(() => {
        if (formType) {
            onModalOpen();
        } else {
            onModalClose();
        }
    }, [formType, onModalOpen, onModalClose]);

    return (
        <Modal 
            isOpen={isModalOpen} 
            onClose={() => setFormType(null)} 
            scrollBehavior='outside' 
            size="xl" 
        >
            <ModalOverlay />
            {/* https://github.com/chakra-ui/chakra-ui/issues/7588 */}
            <ModalContent 
                onWheel={(e) => {
                    e.stopPropagation();
                }}
                onTouchMove={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onScroll={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                <ModalCloseButton/>
                <ModalHeader display="flex" alignItems="center" gap={4}>
                    <ResponsiveText size='lg'>{headerMap[formType]}</ResponsiveText>
                    <Divider orientation="vertical" height='20px'/>
                </ModalHeader>
                {formMap[formType]}
            </ModalContent>
        </Modal>
    );
}