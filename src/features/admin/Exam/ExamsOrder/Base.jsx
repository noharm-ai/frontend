import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFormikContext } from "formik";

import { Select } from "components/Inputs";
import { listExamsOrder } from "../ExamSlice";

export default function ExamsOrderBase() {
  const dispatch = useDispatch();
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const list = useSelector((state) => state.admin.exam.setExamsOrder.list);
  const listLoading = useSelector(
    (state) => state.admin.exam.setExamsOrder.status === "loading"
  );
  const segmentList = useSelector((state) => state.segments.list);

  useEffect(() => {
    if (values.idSegment) {
      dispatch(listExamsOrder({ idSegment: values.idSegment })).then(
        (response) => {
          const examList = [...response.payload.data.data].sort((a, b) => {
            const v1 = a.order === null ? 99 : a.order;
            const v2 = b.order === null ? 99 : b.order;
            return v1 - v2;
          });

          Object.keys(values.exams).forEach((e, idx) => {
            setFieldValue(`exams.${e}`, examList[idx]?.type ?? "");
          });
        }
      );
    }
  }, [values.idSegment]); //eslint-disable-line

  const setExam = (attr, value) => {
    Object.keys(values.exams).forEach((e) => {
      if (values.exams[e] === value) {
        setFieldValue(`exams.${e}`, null);
      }
    });

    setFieldValue(`exams.${attr}`, value);
  };

  return (
    <>
      <div
        className={`form-row ${
          errors.idSegment && touched.idSegment ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Segmento:</label>
        </div>
        <div className="form-input">
          <Select
            onChange={(value) => setFieldValue("idSegment", value)}
            value={values.idSegment}
            status={errors.idSegment && touched.idSegment ? "error" : null}
            placeholder="Selecione o segmento"
            optionFilterProp="children"
            showSearch
            autoFocus
            allowClear
          >
            {segmentList.map(({ id, description: text }) => (
              <Select.Option key={id} value={id}>
                {text}
              </Select.Option>
            ))}
          </Select>
        </div>
        {errors.idSegment && touched.idSegment && (
          <div className="form-error">{errors.idSegment}</div>
        )}
      </div>

      {values.idSegment && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "50% 50%",
            columnGap: "20px",
            background: "#fafafa",
            borderRadius: "8px",
            padding: "10px",
            marginTop: "20px",
          }}
        >
          {Object.keys(values.exams).map((e, idx) => (
            <ExamField
              errors={errors}
              touched={touched}
              values={values}
              listLoading={listLoading}
              list={list}
              idx={idx}
              e={e}
              setExam={setExam}
            />
          ))}
        </div>
      )}
    </>
  );
}

function ExamField({
  errors,
  touched,
  values,
  listLoading,
  list,
  idx,
  e,
  setExam,
}) {
  return (
    <div
      key={e}
      className={`form-row ${
        errors.exams && errors.exams[e] && touched.exams[e] ? "error" : ""
      }`}
      style={{ marginTop: "15px" }}
    >
      <div className="form-input">
        <Select
          onChange={(value) => setExam(e, value || "", idx)}
          value={values.exams[e]}
          status={
            errors.exams && errors.exams[e] && touched.exams[e] ? "error" : null
          }
          loading={listLoading}
          optionFilterProp="children"
          showSearch
          autoFocus
          allowClear
          prefix={`${idx + 1})`}
        >
          {list.map((item) => (
            <Select.Option key={item.type} value={item.type}>
              {item.name} ({item.type})
            </Select.Option>
          ))}
        </Select>
      </div>
      {errors.exams && errors.exams[e] && touched.exams[e] && (
        <div className="form-error">{errors.exams[e]}</div>
      )}
    </div>
  );
}
