import { useEffect } from "react";
import { useFormikContext } from "formik";
import dayjs, { Dayjs } from "dayjs";

import { Select, DatePicker, InputNumber } from "components/Inputs";
import { IExamFormBaseFields } from "./ExamForm";
import { useAppDispatch, useAppSelector } from "src/store";
import { fetchExamTypes } from "./ExamFormSlice";

interface IExamFormBaseProps {
  index?: number;
}

export function ExamFormBase({ index }: IExamFormBaseProps = {}) {
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

  const isArrayMode = index !== undefined;
  const currentExam = isArrayMode ? values.exams?.[index] : (values as any);
  const currentErrors = isArrayMode
    ? (errors.exams?.[index] as any)
    : (errors as any);

  const getFieldName = (field: string) =>
    isArrayMode ? `exams.${index}.${field}` : field;

  return (
    <>
      <div className={`form-row ${currentErrors?.examType ? "error" : ""}`}>
        <div className="form-label">
          <label>Exame:</label>
        </div>
        <div
          className="form-input"
          id={`examType-popupcontainer-${index || 0}`}
        >
          <Select
            value={currentExam?.examType}
            onChange={(val) => setFieldValue(getFieldName("examType"), val)}
            showSearch
            optionFilterProp="label"
            allowClear
            options={examTypeOptions}
            getPopupContainer={() =>
              document.getElementById(
                `examType-popupcontainer-${index || 0}`
              ) || document.body
            }
            loading={examTypesStatus === "loading"}
          />
        </div>
        {currentErrors?.examType && (
          <div className="form-error">{currentErrors.examType}</div>
        )}
      </div>

      <div className={`form-row form-row-flex`}>
        <div className={`form-row ${currentErrors?.examDate ? "error" : ""}`}>
          <div className="form-label">
            <label>Data do exame:</label>
          </div>
          <div className="form-input">
            <DatePicker
              format="DD/MM/YYYY HH:mm"
              value={currentExam?.examDate}
              onChange={(value: Dayjs) => {
                setFieldValue(getFieldName("examDate"), value);
              }}
              popupClassName="noArrow"
              maxDate={dayjs()}
              showTime
            />
          </div>
          {currentErrors?.examDate && (
            <div className="form-error">{currentErrors.examDate}</div>
          )}
        </div>

        <div className={`form-row ${currentErrors?.result ? "error" : ""}`}>
          <div className="form-label">
            <label>Resultado:</label>
          </div>
          <div className="form-input">
            <InputNumber
              value={currentExam?.result}
              onChange={(value: number) =>
                setFieldValue(getFieldName("result"), value)
              }
            />
          </div>
          {currentErrors?.result && (
            <div className="form-error">{currentErrors.result}</div>
          )}
        </div>
      </div>
    </>
  );
}
