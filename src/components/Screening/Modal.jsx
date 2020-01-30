import React from 'react';

import DefaultModal from '@components/Modal';
import Intervention from '@containers/Screening/Intervention';

export default function Modal(props) {
  return (
    <DefaultModal centered destroyOnClose {...props}>
      <Intervention />
    </DefaultModal>
  );
}
