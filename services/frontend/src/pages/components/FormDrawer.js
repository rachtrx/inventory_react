import {
    Button,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeDrawer } from '../../redux/actions/ui';
import CreateUser from './forms/main/CreateUser';
import { Form, Formik } from 'formik';

// A simple mapping
export const formComponents = {
//   'addAsset': Form1,
//   'loanAsset': Form2,
//   'returnAsset': Form3,
//   'condemnAsset': ,
  'createUser': CreateUser,
//   'removeUser': ,
//   'loanAsset': ,
//   'returnAsset': ,
//   'showAsset': ,
//   'showUser':
};

const drawerContentInitialValues = {
    // 'addAsset': {},
    //   'loanAsset': Form2,
    //   'returnAsset': Form3,
    //   'condemnAsset': ,
    //   'createUser': {},
    //   'removeUser': ,
    //   'loanAsset': ,
    //   'returnAsset': ,
    //   'showAsset': ,
    //   'showUser':
}

export default function FormDrawer() { 

    const { isOpen, onOpen, onClose } = useDisclosure();
    const dispatch = useDispatch()
    const {drawerOpen, drawerContent} = useSelector((state) => state.ui);

    useEffect(() => {
        console.log(`drawerOpen: ${drawerOpen}`);
        if (drawerOpen) {
            onOpen();
          } else {
            onClose();
          }
    }, [drawerOpen, onOpen, onClose]);

    const handleClose = () => {
        dispatch(closeDrawer);
    };

    const handleSubmit = (values) => {
        switch(drawerContent) {
            
        }
        console.log(values);
    };

    
    const getInitialValues = (drawerContent) => {
        // Return the initial values based on the content
        const formInitialValues = {
            // default values
        };
    
        if (drawerContent) {
            return { ...formInitialValues, ...drawerContentInitialValues[drawerContent] };
        }
    
        return formInitialValues;
    };
    const initialValues = getInitialValues(drawerContent);
    const SelectedForm = drawerContent ? formComponents[drawerContent] : null;

    return (
        <Drawer
            isOpen={isOpen}
            placement='right'
            onClose={handleClose}
        >
            <DrawerOverlay />
            <DrawerContent >
            <Formik
                initialValues={initialValues}
                // onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {({ setFieldValue }) => (
                <Form style={{ display: "flex", flexDirection: "column", height: "100%"}}>
                    <DrawerCloseButton />
                    <DrawerHeader>Create a new account</DrawerHeader>

                    <DrawerBody style={{ display: "grid", height: "100%", gridTemplateRows: "repeat(auto-fill, 1fr)" }}>
                        {SelectedForm ? <SelectedForm setFieldValue={setFieldValue} /> : <div>No form to display</div>}
                    </DrawerBody>

                    <DrawerFooter>
                        <Button variant='outline' mr={3} onClick={onClose}>
                        Cancel
                        </Button>
                        <Button colorScheme='blue' onClick={handleSubmit}>Submit</Button>
                    </DrawerFooter>
                </Form> 
                )}
            </Formik>
            </DrawerContent>
        </Drawer>
    )
}

// document.getElementById('submitAll').addEventListener('click', function() {
//     const forms = document.querySelectorAll('form');
//     forms.forEach(form => {
//         const formData = new FormData(form);
//         fetch(form.action, {
//             method: 'POST',
//             body: formData,
//         })
//         .then(response => response.json())
//         .then(data => console.log('Success:', data))
//         .catch(error => console.error('Error:', error));
//     });
// });