import React from 'react';

import Icon from '@components/Icon';
import Button from '@components/Button';
import Heading from '@components/Heading';
import { Wrapper, Excerpt } from './Widget.style';

export default function Widget({ id, link, icon, title, excerpt, ...props }) {
  return (
    <Wrapper id={id} {...props}>
      <Icon type={icon} style={{ fontSize: 28, color: '#7ebe9a' }} />
      <Heading as="h4" size="16px" margin="18px 0 15px">
        {title}
      </Heading>
      <Excerpt margin="0 0 30px">{excerpt}</Excerpt>
      <Button type="primary" href={link}>
        Visualizar
      </Button>
    </Wrapper>
  );
}
