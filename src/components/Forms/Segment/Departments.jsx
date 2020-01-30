import 'styled-components/macro';
import React from 'react';
import { useFormikContext } from 'formik';

import { toObject } from '@utils';
import LoadBox from '@components/LoadBox';
import Heading from '@components/Heading';
import { Col, Row } from '@components/Grid';
import { Checkbox } from '@components/Inputs';

// remove duplicate arrays.
const getDepartments = (list, ids) => {
  const data = toObject(list, 'idDepartment');
  return ids.map(id => data[id]);
};

const List = ({ list, defaultValue }) => {
  const { setFieldValue } = useFormikContext();

  const handleChange = checkeds => {
    const departments = getDepartments(list, checkeds);
    setFieldValue('departments', departments);
  };

  return (
    <Checkbox.Group style={{ width: '100%' }} defaultValue={defaultValue} onChange={handleChange}>
      <Row type="flex" gutter={24}>
        {list.map(({ name, idDepartment }) => (
          <Col css="margin-bottom: 20px;" key={idDepartment} span={12}>
            <Checkbox value={idDepartment}>{name}</Checkbox>
          </Col>
        ))}
      </Row>
    </Checkbox.Group>
  );
};

export default function Departments({ isFetching, ...props }) {
  return (
    <Col md={24 - 9} xs={24}>
      <Heading as="h4" size="16px" margin="0 0 10px">
        Setor:
      </Heading>
      {isFetching ? <LoadBox /> : <List {...props} />}
    </Col>
  );
}
