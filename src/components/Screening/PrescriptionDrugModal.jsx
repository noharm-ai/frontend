import React from 'react';

import DefaultModal from '@components/Modal';
import PrescriptionDrug from '@containers/Screening/PrescriptionDrug';

export default function Modal(props) {
  return (
    <DefaultModal centered destroyOnClose {...props}>
      <PrescriptionDrug />
    </DefaultModal>
  );
}
