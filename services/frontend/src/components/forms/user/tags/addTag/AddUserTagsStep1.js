import { Box, Button, Divider, Flex, ModalBody, ModalFooter } from "@chakra-ui/react";
import ExcelFormControl from '../../../utils/ExcelFormControl';
import { FieldArray, Form, Formik } from "formik";
import { useUI } from "../../../../../context/UIProvider";
import { validateUniqueValues } from "../../../utils/validation";
import { setFieldError } from "../../../utils/validation";
import { AddTag } from "./AddTag";
import { ResponsiveText } from "../../../../utils/ResponsiveText";
import { AddButton } from "../../../utils/ItemButtons";
import { useFormModal } from "../../../../../context/ModalProvider";
import { useUserTags } from "../UserTagsProvider";
import { createNewTag } from "../helpers";

export const AddUserTagsStep1 = () => {

    const { nextStep, formData, setValuesExcel } = useUserTags();
    const { setFormType, formRef } = useFormModal();
    const { handleError } = useUI();

    // useEffect(() => {
    //   console.log("User Tag Add Form");
    //   console.log(formData);
    // }, [formData]);
    
    const validateFieldName = (nameDuplicates, field, fieldName) => {
      if (nameDuplicates.has(field)) return `${fieldName} names should be unique`;
      if (!field) return `${fieldName} is Required`;
      return null;
    };
    
    const validateField = (fieldDuplicates, fieldValue, fieldName) => {
      if (fieldDuplicates.has(fieldValue)) return `${fieldName}s should be unique`;
      if (!fieldValue || fieldValue === '') return `${fieldName} is Required`;
      return null;
    }
  
    const validate = values => {
			console.log(formRef.current?.values);
      const errors = {};
      
      const tagDuplicates = validateUniqueValues(values.tags, ['tagName']);

      values.tags.forEach((tag, tagIndex) => {
        const tagError = validateFieldName(tagDuplicates, tag['tagName'], "Tag");
        if (tagError) {
          setFieldError(errors, ['tags', tagIndex, 'tagName'], tagError);
        }
        if (tag['tagName'] && !tag['tagId']) setFieldError(errors, ['tags', tagIndex, 'tagName'], `Please create new tag ${tag['tagName']}`);

        const snDuplicates = validateUniqueValues(values.tags, ['users', 'userName']);
  
        tag.users.forEach((user, userIndex) => {
          if (user.userName && user.userId === '') {
            setFieldError(errors, ['tags', tagIndex, 'users', userIndex, 'userName'], `${user.userName} does not exist!`);
          } else if (user.userTagId) {
            setFieldError(errors, ['tags', tagIndex, 'users', userIndex, 'userName'], `${user.userName} already has ${tag.tagName} tag`);
          } else {
            const unError = validateField(snDuplicates, user['userName'], "User Name");
            if (unError) {
              setFieldError(errors, ['tags', tagIndex, 'users', userIndex, 'userName'], unError);
            }
          }
        });
      });

      console.log(errors);  
      return errors;
    };
  
    return (
      <Box>
        <Formik
          initialValues={formData}
          onSubmit={nextStep}
          validate={validate}
          validateOnChange={true}
          // validateOnBlur={true}
          innerRef={formRef}
          // enableReinitialize={true}
        >
          {({ values, errors }) => {
            return (
              <Form>
                <ModalBody>
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['tag', 'userName', 'remarks']}/>
                  <Divider borderColor="black" borderWidth="2px" my={2} />
                  <FieldArray name="tags">
                  {tagHelpers => (
                    values.tags.map((tag, tagIndex, array) => (
											// Change to single user only
                      <AddTag
                        key={tag.key}
                        tag={tag}
                        tagIndex={tagIndex}
                        tagHelpers={tagHelpers}
                      >
                        {/* children are the helper functions */}
                        <Flex mt={2} gap={4} justifyContent="space-between">
                          {array.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => tagHelpers.remove(tagIndex)}
                              alignSelf="flex-start"
                              colorScheme="red"
                            >
                            <ResponsiveText>{`Remove ${tag.tagName ? ` ${tag.tagName}` : ''}`}</ResponsiveText>
                            </Button>
                          )}
                        </Flex>
                        <Divider borderColor="black" borderWidth="2px" my={4} />
                        {tagIndex === array.length - 1 && (
                        <AddButton
                            handleClick={() => tagHelpers.push(createNewTag())}
                            label="Add Tag Name"
                        />
                        )}
                      </AddTag>
                    ))
                  )}
                  </FieldArray>
                </ModalBody>
                <ModalFooter>
                  <Button variant="outline" onClick={() => setFormType(null)}>Cancel</Button>
                  <Button 
                    colorScheme="blue" 
                    type="submit"
                    onClick={() => {
                      if (Object.keys(errors).length !== 0) {
                        handleError("Please check for invalid data in form")
                      }
                    }}
                  >Next</Button>
                </ModalFooter>
              </Form>
            );
          }}
        </Formik>
      </Box>
    );
  };