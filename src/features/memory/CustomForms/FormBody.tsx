import React, { useState, useEffect } from "react";
import { useFormikContext } from "formik";
import { Tabs, Card, Popconfirm } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
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
  CarouselDot,
} from "./CustomFormEditor.style";
import { CustomForm, emptyGroup, emptyQuestion } from "./types";
import { QuestionCard } from "./QuestionCard";
import notification from "components/notification";
import Tooltip from "src/components/Tooltip";
import stripHtml from "src/utils/stripHtml";

function groupHasErrors(groupErrors: any[], gIdx: number): boolean {
  const ge = groupErrors[gIdx];
  if (!ge) return false;
  if (ge.group) return true;
  return (
    ge.questions?.some((qe: any) => qe && (qe.id || qe.label || qe.formula)) ??
    false
  );
}

function pageHasErrors(
  groupErrors: any[],
  gIdx: number,
  pageIdx: number,
): boolean {
  const qErrors = groupErrors[gIdx]?.questions;
  if (!qErrors) return false;
  const q0 = qErrors[pageIdx * 2];
  const q1 = qErrors[pageIdx * 2 + 1];
  return !!(
    (q0 && (q0.id || q0.label || q0.formula)) ||
    (q1 && (q1.id || q1.label || q1.formula))
  );
}

export function FormBody() {
  const { values, errors, setFieldValue, submitCount } =
    useFormikContext<CustomForm>();
  const [activeKey, setActiveKey] = useState("0");
  const [carouselPages, setCarouselPages] = useState<Record<number, number>>(
    {},
  );
  const [openDescriptions, setOpenDescriptions] = useState<
    Record<number, boolean>
  >({});
  const getPage = (gIdx: number) => carouselPages[gIdx] ?? 0;
  const groupErrors: any[] = (errors as any).data ?? [];

  useEffect(() => {
    if (submitCount === 0) return;
    const gErrors: any[] = (errors as any).data ?? [];

    const firstErrorGroup = values.data.findIndex((_, gIdx) =>
      groupHasErrors(gErrors, gIdx),
    );
    if (firstErrorGroup === -1) return;

    const totalPages = Math.ceil(
      values.data[firstErrorGroup].questions.length / 2,
    );
    let firstErrorPage = 0;
    for (let p = 0; p < totalPages; p++) {
      if (pageHasErrors(gErrors, firstErrorGroup, p)) {
        firstErrorPage = p;
        break;
      }
    }

    setTimeout(() => {
      notification.error({
        message: "Verifique os campos obrigatórios antes de salvar.",
      });

      setActiveKey(String(firstErrorGroup));
      setCarouselPages((prev) => ({
        ...prev,
        [firstErrorGroup]: firstErrorPage,
      }));
    }, 0);
  }, [submitCount]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (field === "type" && value !== "calculated_field") {
      data[gIdx].questions[qIdx].formula = undefined;
    }
    setFieldValue("data", data);
  };

  return (
    <>
      <Card>
        <div className="form-row">
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
      </Card>

      <Tabs
        style={{ marginTop: 16 }}
        activeKey={activeKey}
        onChange={setActiveKey}
        tabBarExtraContent={
          <Button icon={<PlusOutlined />} onClick={addGroup}>
            Adicionar Grupo
          </Button>
        }
        items={values.data.map((g, gIdx) => {
          const hasTabError =
            submitCount > 0 && groupHasErrors(groupErrors, gIdx);
          return {
            key: String(gIdx),
            label: (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {g.group || `Grupo ${gIdx + 1}`}
                {hasTabError && (
                  <ExclamationCircleOutlined
                    style={{ color: "#ff4d4f", fontSize: 13 }}
                  />
                )}
                {values.data.length > 1 && (
                  <Popconfirm
                    title="Remover grupo?"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      removeGroup(gIdx);
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                    okText="Remover"
                    okButtonProps={{ danger: true }}
                    cancelText="Cancelar"
                  >
                    <Tooltip title="Remover grupo">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Tooltip>
                  </Popconfirm>
                )}
              </span>
            ),
            children: (
              <GroupContainer>
                <GroupHeader>
                  <div style={{ flex: 1, minWidth: 0 }}>
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
                        <div className="form-error">
                          {groupErrors[gIdx].group}
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                      {openDescriptions[gIdx] ? (
                        <>
                          <div
                            className="form-label"
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <label>Descrição do grupo:</label>
                            <a
                              role="button"
                              style={{ fontSize: 12, color: "#999" }}
                              onClick={() =>
                                setOpenDescriptions((prev) => ({
                                  ...prev,
                                  [gIdx]: false,
                                }))
                              }
                            >
                              Fechar
                            </a>
                          </div>
                          <div className="form-input">
                            <Editor
                              content={g.description ?? ""}
                              onEdit={(val: string | null) =>
                                updateGroupDescription(gIdx, val ?? "")
                              }
                            />
                          </div>
                        </>
                      ) : g.description && stripHtml(g.description) ? (
                        <div
                          style={{
                            marginTop: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              color: "#666",
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {stripHtml(g.description).slice(0, 100)}
                            {stripHtml(g.description).length > 100 ? "…" : ""}
                          </span>
                          <a
                            role="button"
                            style={{
                              fontSize: 12,
                              whiteSpace: "nowrap",
                              marginLeft: 8,
                            }}
                            onClick={() =>
                              setOpenDescriptions((prev) => ({
                                ...prev,
                                [gIdx]: true,
                              }))
                            }
                          >
                            <EditOutlined /> Editar descrição
                          </a>
                        </div>
                      ) : (
                        <a
                          role="button"
                          style={{ fontSize: 12, color: "#1677ff" }}
                          onClick={() =>
                            setOpenDescriptions((prev) => ({
                              ...prev,
                              [gIdx]: true,
                            }))
                          }
                        >
                          <PlusOutlined /> Adicionar descrição
                        </a>
                      )}
                    </div>
                  </div>
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
                          <span
                            style={{
                              display: "flex",
                              gap: "6px",
                              alignItems: "center",
                            }}
                          >
                            {Array.from({ length: totalPages }, (_, pIdx) => {
                              const isActive = pIdx === currentPage;
                              const hasError =
                                submitCount > 0 &&
                                pageHasErrors(groupErrors, gIdx, pIdx);
                              return (
                                <CarouselDot
                                  key={pIdx}
                                  className={
                                    hasError
                                      ? "error"
                                      : isActive
                                        ? "active"
                                        : undefined
                                  }
                                  onClick={() =>
                                    setCarouselPages((p) => ({
                                      ...p,
                                      [gIdx]: pIdx,
                                    }))
                                  }
                                />
                              );
                            })}
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
                                    groupQuestions={g.questions}
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
          };
        })}
      />
    </>
  );
}
