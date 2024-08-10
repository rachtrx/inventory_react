import { formTypes } from "../../context/ModalProvider";

export const buttonConfigs = {
    [formTypes.LOAN]: { bg: 'blue.100', text: 'Loan' },
    [formTypes.RETURN]: { bg: 'orange.100', text: 'Return' },
    [formTypes.ADD_ASSET]: { bg: 'green.100', text: 'Add' },
    [formTypes.DEL_ASSET]: { bg: 'red.100', text: 'Condemn' },
    [formTypes.ADD_USER]: { bg: 'green.100', text: 'Add' },
    [formTypes.DEL_USER]: { bg: 'red.100', text: 'Remove' },
    [formTypes.ADD_PERIPHERAL]: { bg: 'green.100', text: 'Add' },
    [formTypes.TAG]: { bg: 'blue.100', text: 'Tag Peripheral' },
    [formTypes.UNTAG]: { bg: 'orange.100', text: 'Untag Peripheral' },
    [formTypes.RESTORE_ASSET]: { bg: 'red.100', text: 'Restore' },
    [formTypes.RESTORE_USER]: { bg: 'red.100', text: 'Restore' },
  };