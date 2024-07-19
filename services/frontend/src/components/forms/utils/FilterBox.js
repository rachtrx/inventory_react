import { Box, Button, Flex, Grid, Heading } from "@chakra-ui/react";
import { Formik, Field, Form } from 'formik';


export default function FilterBox({children, label}) {

    // const initialValues = {
    //     dept: '',
    //     username: '',
    //     remarks: '',
    // };

    const handleSubmit = (values, actions) => {
        actions.setSubmitting(false);
    }


    return (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={6}>
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Heading as="h1" size="xl">{label}</Heading>
                <Button colorScheme="blue">Export to Excel</Button>
            </Flex>

            <Formik
                // initialValues={initialValues}
                onSubmit={handleSubmit}
            >
            {({ props }) => (
                <Form>
                <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                    {children}
                    <Flex justifyContent="space-between" mt={4} gridColumn="span 3 / auto">
                        <Button colorScheme="gray" variant="outline" type="reset">Reset</Button>
                        <Button colorScheme="blue" type="submit">Search</Button>
                    </Flex>
                </Grid>
                </Form>
            )}
            </Formik>
        </Box>
    )
}