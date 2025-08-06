import { useEffect } from "react";
import { useFormikContext } from "formik";
import dayjs, { Dayjs } from "dayjs";

import { Select, DatePicker, InputNumber } from "components/Inputs";
import { IExamFormBaseFields } from "./ExamForm";
import { useAppDispatch, useAppSelector } from "src/store";
import { fetchExamTypes } from "./ExamFormSlice";

export function ExamFormBase() {
  const dispatch = useAppDispatch();
  const examTypes = useAppSelector((state) => state.examsForm.examTypes.list);
  const examTypesStatus = useAppSelector(
    (state) => state.examsForm.examTypes.status
  );
  const { values, errors, setFieldValue } =
    useFormikContext<IExamFormBaseFields>();

  useEffect(() => {
    if (examTypes.length === 0) {
      dispatch(fetchExamTypes({}));
    }
  }, [dispatch, examTypes.length]);

  const examTypeOptions = examTypes.map((item) => ({
    label: `${item.name} (${item.examType})`,
    value: item.examType,
  }));

  return (
    <>
      <div className={`form-row ${errors.examType ? "error" : ""}`}>
        <div className="form-label">
          <label>Exame:</label>
        </div>
        <div className="form-input" id="examType-popupcontainer">
          <Select
            value={values.examType}
            onChange={(val) => setFieldValue("examType", val)}
            showSearch
            optionFilterProp="label"
            allowClear
            options={examTypeOptions}
            getPopupContainer={() =>
              document.getElementById("examType-popupcontainer") ||
              document.body
            }
            loading={examTypesStatus === "loading"}
          />
        </div>
        {errors.examType && <div className="form-error">{errors.examType}</div>}
      </div>

      <div className={`form-row ${errors.examDate ? "error" : ""}`}>
        <div className="form-label">
          <label>Data do exame:</label>
        </div>
        <div className="form-input">
          <DatePicker
            format="DD/MM/YYYY HH:mm"
            value={values.examDate}
            onChange={(value: Dayjs) => {
              setFieldValue("examDate", value);
            }}
            popupClassName="noArrow"
            maxDate={dayjs()}
            showTime
          />
        </div>
        {errors.examDate && <div className="form-error">{errors.examDate}</div>}
      </div>

      <div className={`form-row ${errors.result ? "error" : ""}`}>
        <div className="form-label">
          <label>Resultado:</label>
        </div>
        <div className="form-input">
          <InputNumber
            value={values.result}
            onChange={(value: number) => setFieldValue("result", value)}
          />
        </div>
        {errors.result && <div className="form-error">{errors.result}</div>}
      </div>
    </>
  );
}
