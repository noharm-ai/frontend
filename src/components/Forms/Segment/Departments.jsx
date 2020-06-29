import 'styled-components/macro';
import React from 'react';
import { useFormikContext } from 'formik';

import LoadBox from '@components/LoadBox';
import { Col, Row } from '@components/Grid';
import { Checkbox } from '@components/Inputs';

const List = ({ list }) => {
  const { setFieldValue, values } = useFormikContext();
  const { departments } = values;

  const handleChange = checkeds => {
    setFieldValue('departments', checkeds);
  };

  return (
    <Checkbox.Group
      style={{ width: '100%', marginLeft: '20px' }}
      value={departments}
      onChange={handleChange}
    >
      <Row type="flex" gutter={24}>
        {list.map(({ name, idDepartment }) => (
          <Col css="margin-bottom: 20px;" key={idDepartment} span={8}>
            <Checkbox value={idDepartment}>{name}</Checkbox>
          </Col>
        ))}
      </Row>
    </Checkbox.Group>
  );
};

export default function Departments({ isFetching, ...props }) {
  return (
    <Col md={24} xs={24}>
      {isFetching ? <LoadBox /> : <List {...props} />}
    </Col>
  );
}
