import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import { Tag, TagCloseButton, TagRightIcon, TagLabel, NumberInputStepper } from '@chakra-ui/react'
import React, { useState } from 'react'

import { IonIcon } from '@ionic/react'
import { closeOutline } from 'ionicons/icons'

export default function ToggleTag({val, initial, selection, setSelection, index}) {
    const [selected, setSelected] = useState(initial);

  return (
    <Tag
        borderRadius='full'
        variant='solid'
        colorScheme={selected ? 'green' : 'gray'}
        mb={'1'}
        mr={1}
        size={'md'}
        _hover={{cursor: 'pointer'}}
        onClick={() => {
          var newSelection = [...selection];
          newSelection[index] = !selected;
          setSelection(newSelection);
          setSelected(!selected);
        }}
    >
        <TagLabel>{val}</TagLabel>
        {selected && <TagCloseButton/>}
    </Tag>
  )
}
