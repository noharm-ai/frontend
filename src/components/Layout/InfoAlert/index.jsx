import React, { useEffect, useState } from 'react';

import Alert from '@components/Alert';
import infoAlert from '@utils/infoAlert';

export default function InfoAlert({ access_token, userId }) {
  const [currentAlert, setCurrentAlert] = useState(null);

  useEffect(() => {
    const hasAlert = async () => {
      if (await infoAlert.hasAlert(access_token, userId)) {
        setCurrentAlert(infoAlert.getAlert());
      }
    };

    hasAlert();
  }, []); // eslint-disable-line

  const onClose = () => {
    infoAlert.gotIt(access_token, userId);
  };

  if (!currentAlert) {
    return null;
  }

  return (
    <div style={{ marginLeft: '10px' }}>
      <Alert
        message={currentAlert.message(onClose)}
        type="info"
        closable
        style={{ paddingRight: '50px' }}
        onClose={onClose}
      />
    </div>
  );
}
