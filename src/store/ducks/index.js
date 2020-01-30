import { combineReducers } from 'redux';

import appReducer from './app';
import authReducer from './auth';
import userReducer from './user';
import drugsReducer from './drugs';
import sessionReducer from './session';
import outliersReducer from './outliers';
import patientsReducer from './patients';
import segmentsReducer from './segments';
import interventionReducer from './intervention';
import departmentsReducer from './departments';
import prescriptionsReducer from './prescriptions';

export default combineReducers({
  app: appReducer,
  auth: authReducer,
  user: userReducer,
  drugs: drugsReducer,
  session: sessionReducer,
  outliers: outliersReducer,
  patients: patientsReducer,
  segments: segmentsReducer,
  departments: departmentsReducer,
  intervention: interventionReducer,
  prescriptions: prescriptionsReducer
});
