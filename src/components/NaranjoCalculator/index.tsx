import { Formik } from "formik";

import { Radio } from "components/Inputs";
import Button from "components/Button";

import { Form } from "styles/Form.style";

interface INaranjoCalculatorProps {
  modalRef: any;
  setResponse: (result: number) => void;
}

interface INaranjoFields {
  question1: number;
  question2: number;
  question3: number;
  question4: number;
  question5: number;
  question6: number;
  question7: number;
  question8: number;
  question9: number;
  question10: number;
}

export function NaranjoCalculator({
  modalRef,
  setResponse,
}: INaranjoCalculatorProps) {
  const DO_NOT_APPLY = 99;
  const questions: { question: string; yes: number; no: number }[] = [
    {
      question: "Existem relatos prévios sobre esta reação?",
      yes: 1,
      no: 0,
    },
    {
      question: "A reação apareceu após a administração do fármaco suspeito?",
      yes: 2,
      no: -1,
    },
    {
      question:
        "A reação desapareceu quando o fármaco suspeito foi suspenso ou quando um antagonista específico foi administrado?",
      yes: 1,
      no: 0,
    },
    {
      question: "A reação reapareceu quando o medicamento foi readministrado?",
      yes: 2,
      no: -1,
    },
    {
      question: "Existem outras causas que possam explicar a reação?",
      yes: -1,
      no: 2,
    },
    {
      question: "A reação aparece com a introdução do placebo?",
      yes: -1,
      no: 1,
    },
    {
      question:
        "A concentração plasmática do medicamento está em nível tóxico?",
      yes: 1,
      no: 0,
    },
    {
      question: "A reação aumentou com dose maior ou diminuiu com dose menor?",
      yes: 1,
      no: 0,
    },
    {
      question:
        "O paciente tem história de reação semelhante com o mesmo medicamento ou similar?",
      yes: 1,
      no: 0,
    },
    {
      question: "A reação foi confirmada por evidência objetiva?",
      yes: 1,
      no: 0,
    },
  ];

  const defaultValues: Partial<INaranjoFields> = {};
  questions.forEach((_, index) => {
    defaultValues[`question${index + 1}` as keyof INaranjoFields] =
      DO_NOT_APPLY;
  });

  const initialValues = defaultValues as INaranjoFields;

  const submit = (params: INaranjoFields) => {
    modalRef.destroy();
    setResponse(2);

    let result = 0;

    Object.values(params).forEach((v) => {
      if (v !== DO_NOT_APPLY) {
        result += v;
      }
    });

    setResponse(result);
  };

  return (
    <Formik enableReinitialize onSubmit={submit} initialValues={initialValues}>
      {({ handleSubmit, errors, values, setFieldValue }) => (
        <Form>
          {questions.map((q, index) => (
            <div className={`form-row`} key={q.question}>
              <div className="form-label">
                <label>{q.question}</label>
              </div>
              <div className="form-input">
                <Radio.Group
                  onChange={({ target }) =>
                    setFieldValue(`question${index + 1}`, target.value)
                  }
                  value={values[`question${index + 1}` as keyof INaranjoFields]}
                  size="small"
                >
                  <Radio.Button value={q.yes}>Sim</Radio.Button>
                  <Radio.Button value={q.no}>Não</Radio.Button>
                  <Radio.Button value={DO_NOT_APPLY}>
                    Não se aplica
                  </Radio.Button>
                </Radio.Group>
              </div>
              {errors[`question${index + 1}` as keyof INaranjoFields] && (
                <div className="form-error">
                  {errors[`question${index + 1}` as keyof INaranjoFields]}
                </div>
              )}
            </div>
          ))}

          <div className="form-action" style={{ marginTop: "20px" }}>
            <Button onClick={() => modalRef.destroy()}>Cancelar</Button>
            <Button onClick={() => handleSubmit()} type="primary">
              Calcular e aplicar
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
