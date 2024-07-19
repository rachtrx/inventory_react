import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputFormControl from './InputFormControl';


function AssetTagField({isNew}):
 {
  return (
    {isNew ? <> :
       <InputFormControl name="asset-tag" label="asset-tag" placeholder="Asset Tag"/>
    }
}

export default CondemnDevice;