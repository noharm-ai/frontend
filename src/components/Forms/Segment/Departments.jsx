import "styled-components/macro";
import React from "react";
import { useFormikContext } from "formik";

import LoadBox from "components/LoadBox";
import Empty from "components/Empty";
import { Col, Row } from "components/Grid";
import { Checkbox } from "components/Inputs";
import Tooltip from "components/Tooltip";

const List = ({ list }) => {
  const { setFieldValue, values } = useFormikContext();
  const { departments } = values;

  const handleChange = (checkeds) => {
    setFieldValue("departments", checkeds);
  };

  return (
    <>
      <Checkbox.Group
        style={{ width: "100%", marginLeft: "20px" }}
        value={departments}
        onChange={handleChange}
      >
        <Row type="flex" gutter={24}>
          {list.map(({ name, idDepartment, checked, uses }) => (
            <Col css="margin-bottom: 20px;" key={idDepartment} span={8}>
              <Tooltip
                title={
                  !checked && uses > 0
                    ? "Este setor está sendo usado em outro segmento"
                    : ""
                }
              >
                <Checkbox value={idDepartment} disabled={!checked && uses > 0}>
                  {name}
                </Checkbox>
              </Tooltip>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
      {!list.length && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Nenhum setor cadastrado neste hospital."
        />
      )}
    </>
  );
};

export default function Departments({ isFetching, ...props }) {
  return (
    <Col md={24} xs={24}>
      {isFetching ? <LoadBox /> : <List {...props} />}
    </Col>
  );
}
