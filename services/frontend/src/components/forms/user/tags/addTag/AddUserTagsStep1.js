import { Box, Button, Divider, Flex, ModalBody, ModalFooter, Text } from "@chakra-ui/react";
import ExcelFormControl from '../../../utils/ExcelFormControl';
import { FieldArray, Form, Formik } from "formik";
import { useUI } from "../../../../../context/UIProvider";
import { validateUniqueValues } from "../../../utils/validation";
import { setFieldError } from "../../../utils/validation";
import { AddTag } from "./AddTag";
import { AddButton } from "../../../utils/ItemButtons";
import { useForm } from "../../../../../context/FormProvider";
import { useUserTags } from "../UserTagsProvider";
import { createNewTag, setValuesExcel } from "../helpers";
import { useStep } from "../../../../../context/StepProvider";
import userService from "../../../../../services/UserService";

export const AddUserTagsStep1 = () => {

    const { tagOptions, setUserOptions } = useUserTags();
    const { nextStep } = useStep();
    const { setFormType, formRef, reinitializeForm } = useForm();
    const { handleError } = useUI();

    const initialFormValues = {
      tags: [createNewTag()],
    }
    
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

        const unDuplicates = validateUniqueValues(tag.users, ['userName']);
  
        tag.users.forEach((user, userIndex) => {
          if (user.userName && user.userId === '') {
            setFieldError(errors, ['tags', tagIndex, 'users', userIndex, 'userName'], `${user.userName} does not exist!`);
          } else if (user.tagIds.includes(tag.tagId)) {
            setFieldError(errors, ['tags', tagIndex, 'users', userIndex, 'userName'], `${user.userName} already has ${tag.tagName} tag`);
          } else {
            const unError = validateField(unDuplicates, user['userName'], "User Name");
            if (unError) {
              setFieldError(errors, ['tags', tagIndex, 'users', userIndex, 'userName'], unError);
            }
          }
        });
      });

      console.log(errors);  
      return errors;
    };

    const onUpload = async (records) => {
      await setValuesExcel({
        records,
        tagOptions,
        fetchUsrForTagsFunc: userService.fetchTagUser,
        setUserOptions,
        reinitializeForm,
        handleError
      });
    };
  
    return (
      <Box>
        <Formik
          initialValues={initialFormValues}
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
                  <ExcelFormControl loadValues={onUpload} templateCols={['tag', 'userName', 'remarks']}/>
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
                            <Text>{`Remove ${tag.tagName ? ` ${tag.tagName}` : ''}`}</Text>
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