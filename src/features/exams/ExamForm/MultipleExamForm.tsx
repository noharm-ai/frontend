import { FieldArray, useFormikContext } from "formik";

import Button from "components/Button";

import { IExamFormBaseFields, IExamItem } from "./ExamForm";
import { ExamFormBase } from "./ExamFormBase";

export function MultipleExamForm() {
  const { values } = useFormikContext<IExamFormBaseFields>();

  return (
    <FieldArray name="exams">
      {({ push, remove }) => (
        <div>
          {values.exams?.map((_: IExamItem, index: number) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #ccc",
                }}
              >
                <h4 style={{ margin: 0 }}>Exame {index + 1}</h4>
                {values.exams.length > 1 && (
                  <Button
                    type="link"
                    danger
                    onClick={() => remove(index)}
                    size="small"
                  >
                    Remover
                  </Button>
                )}
              </div>
              <div style={{ padding: "10px", background: "#f9f9f9" }}>
                <ExamFormBase index={index} />
              </div>
            </div>
          ))}

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Button
              type="dashed"
              onClick={() =>
                push({ examType: "", examDate: undefined, result: undefined })
              }
              style={{ width: "100%" }}
            >
              + Adicionar Exame
            </Button>
          </div>
        </div>
      )}
    </FieldArray>
  );
}
