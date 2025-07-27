import { Tag, TagCloseButton, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { AssetActionButton } from "../buttons/actions/AssetActionButton";
import { FormType } from "../../context/ModalProvider";
import { UserActionButton } from "../buttons/actions/UserActionButton";
import { FaPlus } from "react-icons/fa";

export const Tags = ({ tags, onRemoveTag, textSize, children, ...rest }) => {

  // console.log(textSize);
  return (
    <Wrap align="center" {...rest}>
      {tags.map(tag => (
        <WrapItem key={tag.tagId}>
          <Tag size="xs" variant="solid" bg="#3498db" p={1}>
            <Text fontSize={textSize}>{tag.tagName}</Text>
            {onRemoveTag && <TagCloseButton onClick={() => onRemoveTag(tag)} />}
          </Tag>
        </WrapItem>
      ))}
      {children ? <WrapItem>{children}</WrapItem> : undefined}
    </Wrap>
  );
};

export const AssetTags = ({asset, tags, onRemoveTag, ...rest}) => (
  <Tags tags={tags} onRemoveTag={onRemoveTag} {...rest}>
    {/* <AssetActionButton asset={asset} formType={FormType.TAG_ASSET} icon={<FaPlus/>}/> */}
  </Tags>
)

export const UserTags = ({user, tags, onRemoveTag, ...rest}) => (
  <Tags tags={tags} onRemoveTag={onRemoveTag} {...rest}>
    {/* <UserActionButton user={user} formType={FormType.TAG_USER}/> */}
  </Tags>
)
