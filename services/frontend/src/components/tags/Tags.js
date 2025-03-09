import { Box, Heading, Tag, TagCloseButton, TagLabel, Wrap, WrapItem } from "@chakra-ui/react";
import { ResponsiveText } from "../utils/ResponsiveText";

const Tags = ({ tags, onRemoveTag }) => {
  return (
    <Wrap>
      {tags.map(tag => (
        <WrapItem key={tag.tagId}>
          <Tag size="xs" variant="solid" bg="#3498db" p={1}>
            <ResponsiveText size="xs">{tag.tagName}</ResponsiveText>
            {onRemoveTag && <TagCloseButton onClick={() => onRemoveTag(tag)} />}
          </Tag>
        </WrapItem>
      ))}
    </Wrap>
  );
};

export default Tags;
