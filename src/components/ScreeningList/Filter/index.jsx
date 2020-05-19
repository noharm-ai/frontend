import React, { useEffect, useState, useCallback } from 'react';
import isEmpty from 'lodash.isempty';
import moment from 'moment';
import 'moment/locale/pt-br';
import { subDays } from 'date-fns';

import message from '@components/message';
import Heading from '@components/Heading';
import { Row, Col } from '@components/Grid';
import { Select, DatePicker } from '@components/Inputs';
import { Box } from './Filter.style';
import './index.css';

export default function Filter({
  fetchPrescriptionsList,
  segments,
  fetchDepartmentsList,
  resetDepartmentsLst,
  updatePrescriptionListStatus
}) {
  const [idSegment, setIdSegment] = useState(null);
  const [idDepartment, setIdDepartment] = useState('all');
  const [date, setDate] = useState(moment());

  const getParams = useCallback(
    forceParams => {
      const params = {
        idSegment,
        idDept: idDepartment,
        date: date ? date.format('YYYY-MM-DD') : 'all'
      };
      const mixedParams = { ...params, ...forceParams };
      const finalParams = {};

      for (const key in mixedParams) {
        if (mixedParams[key] !== 'all') {
          finalParams[key] = mixedParams[key];
        }
      }

      return finalParams;
    },
    [idSegment, idDepartment, date]
  );

  useEffect(() => {
    if (!isEmpty(segments.error)) {
      message.error(segments.error.message);
    }
  }, [segments.error]);

  useEffect(() => {
    if (idSegment == null) return;

    if (idSegment !== 'all') {
      fetchDepartmentsList(idSegment);
      fetchPrescriptionsList({ idSegment });
    } else {
      resetDepartmentsLst();
      fetchPrescriptionsList();
    }
  }, [idSegment, fetchDepartmentsList, fetchPrescriptionsList, resetDepartmentsLst]);

  // update list status
  const updateStatus = useCallback(() => {
    if (segments.list.length === 0) return;

    updatePrescriptionListStatus(getParams());
  }, [segments, updatePrescriptionListStatus, getParams]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateStatus();
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [idSegment, idDepartment, updateStatus]);

  useEffect(() => {
    window.addEventListener('focus', updateStatus);

    return () => {
      window.removeEventListener('focus', updateStatus);
    };
  }, [updateStatus]);

  const onDepartmentChange = idDept => {
    setIdDepartment(idDept);

    fetchPrescriptionsList(getParams({ idDept }));
  };

  const onDateChange = dt => {
    setDate(dt);

    fetchPrescriptionsList(getParams({ date: dt ? dt.format('YYYY-MM-DD') : 'all' }));
  };

  useEffect(() => {
    setIdSegment(segments.list.length ? segments.list[0].id : null);
  }, [segments.list]);

  const disabledDate = current => {
    return current < subDays(new Date(), 8) || current > (new Date());
  };

  return (
    <div style={{ marginBottom: 15 }}>
      <Row gutter={16}>
        <Col md={8}>
          <Box>
            <Heading as="label" htmlFor="segments" size="16px" margin="0 10px 0 0">
              Segmento:
            </Heading>
            <Select
              id="segments"
              style={{ width: '100%' }}
              placeholder="Selectione um segmento..."
              loading={segments.isFetching}
              onChange={idSegment => setIdSegment(idSegment)}
              value={idSegment}
            >
              <Select.Option value="all">Todos os segmentos</Select.Option>
              {segments.list.map(({ id, description: text }) => (
                <Select.Option key={id} value={id}>
                  {text}
                </Select.Option>
              ))}
            </Select>
          </Box>
        </Col>

        <Col md={6}>
          <Box>
            <Heading as="label" htmlFor="departments" size="16px" margin="0 10px 0 0">
              Setor:
            </Heading>
            <Select
              id="departments"
              style={{ width: '100%' }}
              placeholder="Selectione um setor..."
              loading={segments.single.isFetching}
              value={idDepartment}
              onChange={onDepartmentChange}
            >
              <Select.Option value="all">Todos os setores</Select.Option>

              {segments.single.content.departments &&
                segments.single.content.departments.map(({ idDepartment, name }) => (
                  <Select.Option key={idDepartment} value={idDepartment}>
                    {name}
                  </Select.Option>
                ))}
            </Select>
          </Box>
        </Col>
        <Col md={4}>
          <Box>
            <Heading as="label" htmlFor="date" size="16px" margin="0 10px 0 0">
              Data:
            </Heading>
            <DatePicker
              format="DD/MM/YYYY"
              disabledDate={disabledDate}
              defaultValue={date}
              onChange={onDateChange}
              dropdownClassName="noArrow"
              allowClear={false}
            />
          </Box>
        </Col>
      </Row>
    </div>
  );
}
