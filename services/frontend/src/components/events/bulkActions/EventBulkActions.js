import { HStack } from "@chakra-ui/react";
import { AddAssetTags } from "./AddAssetTags";
import { AddAssetsProvider } from "../../forms/asset/addAsset/AddAssetsProvider";

export const EventBulkActions = () => {
    
    return (
        <HStack>
            <AddAssetsProvider>
                <AddAssetTags/>
            </AddAssetsProvider>
        </HStack>
    )
}