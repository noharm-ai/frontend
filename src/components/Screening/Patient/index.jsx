import 'styled-components/macro';
import React from 'react';

import Heading from '@components/Heading';
import Segment from './Segment';
import { Wrapper, Name, Box } from './Patient.style';

function Cell({ children }) {
  return (
    <Box>
      <p>{children}</p>
    </Box>
  );
}

export default function Patient({
  dateFormated,
  age,
  gender,
  weight,
  skinColor,
  creatinina,
  mdrd,
  tgo,
  tgp,
  namePatient,
  segment
}) {
  return (
    <>
      <Wrapper>
        <Name as="h3" size="18px">
          {namePatient || '-'}
        </Name>
        <Cell>
          <Heading as="strong" size="10px" css="display: block;">
            Data da prescrição
          </Heading>
          {dateFormated}
        </Cell>
        <Cell>{age || '-'}</Cell>
        <Cell>{gender || '-'}</Cell>
        <Cell>{weight ? `${weight} Kg` : '-'}</Cell>
        <Cell>{skinColor || '-'}</Cell>
        <Cell>
          <Heading as="span" size="14px">
            Creatinina:{' '}
          </Heading>
          {creatinina || '-'}
        </Cell>
        <Cell>
          <Heading as="span" size="14px">
            MDRD:{' '}
          </Heading>
          {mdrd || '-'}
        </Cell>
        <Cell>
          <Heading as="span" size="14px">
            TGO:{' '}
          </Heading>
          {tgo || '-'}
        </Cell>
        <Cell>
          <Heading as="span" size="14px">
            TGP:{' '}
          </Heading>
          {tgp || '-'}
        </Cell>
      </Wrapper>
      <Segment {...segment} />
    </>
  );
}
