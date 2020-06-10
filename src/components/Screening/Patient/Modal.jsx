import React from 'react';

import DefaultModal from '@components/Modal';
import FormPatient from '@containers/Forms/Patient';

export default function Modal(props) {
  return (
    <DefaultModal centered destroyOnClose {...props}>
      <FormPatient />
    </DefaultModal>
  );
}
