import React from 'react';
import { useRouteMatch } from 'react-router-dom';

import { routeToId } from '@utils/transformers/help';

export default function Help() {
  const location = useRouteMatch();
  return <strong>Help mee - {routeToId(location.path)}</strong>;
}
