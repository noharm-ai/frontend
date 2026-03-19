import React, { useState } from "react";
import { useFormikContext } from "formik";
import { Divider, Tabs } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";

import Switch from "components/Switch";
import { Input } from "components/Inputs";
import Editor from "components/Editor";
import Button from "components/Button";
import {
  GroupContainer,
  GroupHeader,
  CarouselWrapper,
  CarouselTrack,
  CarouselSlide,
  CarouselNav,
} from "./CustomFormEditor.style";
import { CustomForm, emptyGroup, emptyQuestion } from "./types";
import { QuestionCard } from "./QuestionCard";

export function FormBody() {
  const { values, errors, setFieldValue } = useFormikContext<CustomForm>();
  const [activeKey, setActiveKey] = useState("0");
  const [carouselPages, setCarouselPages] = useState<Record<number, number>>(
    {},
  );
  const getPage = (gIdx: number) => carouselPages[gIdx] ?? 0;

  const addGroup = () => {
    const newIdx = values.data.length;
    setFieldValue("data", [...values.data, emptyGroup()]);
    setActiveKey(String(newIdx));
  };

  const removeGroup = (gIdx: number) => {
    const currentActive = parseInt(activeKey);
    setFieldValue(
      "data",
      values.data.filter((_, i) => i !== gIdx),
    );
    if (gIdx < currentActive) {
      setActiveKey(String(currentActive - 1));
    } else if (gIdx === currentActive) {
      setActiveKey(String(Math.max(0, gIdx - 1)));
    }
    setCarouselPages((prev) => {
      const next: Record<number, number> = {};
      Object.entries(prev).forEach(([key, val]) => {
        const k = Number(key);
        if (k < gIdx) next[k] = val;
        else if (k > gIdx) next[k - 1] = val;
      });
      return next;
    });
  };

  const updateGroupName = (gIdx: number, value: string) => {
    const data = JSON.parse(JSON.stringify(values.data));
    data[gIdx].group = value;
    setFieldValue("data", data);
  };

  const updateGroupDescription = (gIdx: number, value: string) => {
    const data = JSON.parse(JSON.stringify(values.data));
    data[gIdx].description = value;
    setFieldValue("data", data);
  };

  const addQuestion = (gIdx: number) => {
    const data = JSON.parse(JSON.stringify(values.data));
    data[gIdx].questions = [...data[gIdx].questions, emptyQuestion()];
    setFieldValue("data", data);
    const lastPage = Math.ceil(data[gIdx].questions.length / 2) - 1;
    setCarouselPages((prev) => ({ ...prev, [gIdx]: lastPage }));
  };

  const removeQuestion = (gIdx: number, qIdx: number) => {
    const data = JSON.parse(JSON.stringify(values.data));
    data[gIdx].questions = data[gIdx].questions.filter(
      (_: any, i: number) => i !== qIdx,
    );
    setFieldValue("data", data);
    const maxPage = Math.max(0, Math.ceil(data[gIdx].questions.length / 2) - 1);
    setCarouselPages((prev) => ({
      ...prev,
      [gIdx]: Math.min(prev[gIdx] ?? 0, maxPage),
    }));
  };

  const updateQuestion = (
    gIdx: number,
    qIdx: number,
    field: string,
    value: any,
  ) => {
    const data = JSON.parse(JSON.stringify(values.data));
    data[gIdx].questions[qIdx][field] = value;
    if (
      field === "type" &&
      value !== "options" &&
      value !== "options-multiple"
    ) {
      data[gIdx].questions[qIdx].options = [];
    }
    setFieldValue("data", data);
  };

  const groupErrors: any[] = (errors as any).data ?? [];

  return (
    <>
      <div className="form-row form-row-flex">
        <div className="form-row" style={{ flex: 1 }}>
          <div className="form-label">
            <label>Nome do formulário:</label>
          </div>
          <div className="form-input">
            <Input
              value={values.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFieldValue("name", e.target.value)
              }
              placeholder="Nome do formulário"
            />
          </div>
          {(errors as any).name && (
            <div className="form-error">{(errors as any).name}</div>
          )}
        </div>
        <div className="form-row">
          <div className="form-label">
            <label>Ativo:</label>
          </div>
          <div className="form-input">
            <Switch
              checked={values.active !== false}
              onChange={(val) => setFieldValue("active", val)}
            />
          </div>
        </div>
      </div>

      <Divider />

      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        tabBarExtraContent={
          <Button icon={<PlusOutlined />} onClick={addGroup}>
            Adicionar Grupo
          </Button>
        }
        items={values.data.map((g, gIdx) => ({
          key: String(gIdx),
          label: g.group || `Grupo ${gIdx + 1}`,
          children: (
            <GroupContainer>
              <GroupHeader>
                <div className="group-name-field">
                  <div className="form-label">
                    <label>Grupo:</label>
                  </div>
                  <div className="form-input">
                    <Input
                      value={g.group}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateGroupName(gIdx, e.target.value)
                      }
                      placeholder="Nome do grupo"
                    />
                  </div>
                  {groupErrors[gIdx]?.group && (
                    <div className="form-error">{groupErrors[gIdx].group}</div>
                  )}
                </div>
                <div className="group-name-field">
                  <div className="form-label">
                    <label>Descrição do grupo:</label>
                  </div>
                  <div className="form-input">
                    <Editor
                      content={g.description ?? ""}
                      onEdit={(val: string | null) =>
                        updateGroupDescription(gIdx, val ?? "")
                      }
                    />
                  </div>
                </div>
                {values.data.length > 1 && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeGroup(gIdx)}
                  >
                    Remover Grupo
                  </Button>
                )}
              </GroupHeader>

              <div className="form-row">
                <div className="form-label">
                  <label>Questões:</label>
                </div>
              </div>

              {(() => {
                const currentPage = getPage(gIdx);
                const totalPages = Math.ceil(g.questions.length / 2);
                const pages: Array<typeof g.questions> = [];
                for (let i = 0; i < g.questions.length; i += 2) {
                  pages.push(g.questions.slice(i, i + 2));
                }
                const canPrev = currentPage > 0;
                const canNext = currentPage < totalPages - 1;

                return (
                  <>
                    {totalPages > 1 && (
                      <CarouselNav>
                        <Button
                          icon={<LeftOutlined />}
                          size="small"
                          disabled={!canPrev}
                          onClick={() =>
                            setCarouselPages((p) => ({
                              ...p,
                              [gIdx]: currentPage - 1,
                            }))
                          }
                        />
                        <span style={{ fontSize: "13px", color: "#666" }}>
                          {currentPage + 1} / {totalPages}
                        </span>
                        <Button
                          icon={<RightOutlined />}
                          size="small"
                          disabled={!canNext}
                          onClick={() =>
                            setCarouselPages((p) => ({
                              ...p,
                              [gIdx]: currentPage + 1,
                            }))
                          }
                        />
                      </CarouselNav>
                    )}

                    <CarouselWrapper>
                      <CarouselTrack page={currentPage}>
                        {pages.map((pageQuestions, pageIdx) => (
                          <CarouselSlide key={pageIdx}>
                            {pageQuestions.map((q, slotIdx) => {
                              const qIdx = pageIdx * 2 + slotIdx;
                              const qErrors =
                                groupErrors[gIdx]?.questions?.[qIdx] ?? {};

                              return (
                                <QuestionCard
                                  key={qIdx}
                                  q={q}
                                  qIdx={qIdx}
                                  gIdx={gIdx}
                                  canRemove={g.questions.length > 1}
                                  errors={qErrors}
                                  onUpdate={updateQuestion}
                                  onRemove={removeQuestion}
                                />
                              );
                            })}
                          </CarouselSlide>
                        ))}
                      </CarouselTrack>
                    </CarouselWrapper>

                    <div style={{ marginTop: "0.75rem" }}>
                      <Button
                        block
                        icon={<PlusOutlined />}
                        onClick={() => addQuestion(gIdx)}
                      >
                        Adicionar Questão
                      </Button>
                    </div>
                  </>
                );
              })()}
            </GroupContainer>
          ),
        }))}
      />
    </>
  );
}
