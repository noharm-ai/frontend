import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, Empty, Select, Spin, Tag, Tooltip } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import styled from "styled-components";

import notification from "components/notification";
import Permission from "models/Permission";
import PermissionService from "services/PermissionService";
import { getErrorMessage } from "utils/errorHandler";
import { useAppDispatch } from "src/store";

import {
  fetchTimelineExams,
  ITimelineExam,
  ITimelineExamsSaved,
  saveTimelineExams,
} from "../InfectionControlListSlice";
import { SettingVersions } from "../InfectionControlSettings/SettingVersions/SettingVersions";

// the timeline opens with ten exams at most (MAX_TIMELINE_EXAMS in backend)
const MAX_EXAMS = 10;

const Body = styled.div`
  .timeline-exams-description {
    margin-bottom: 16px;
  }

  .timeline-exams-loading {
    display: flex;
    justify-content: center;
    padding: 24px 0;
  }

  .timeline-exams-notice {
    margin-bottom: 12px;
  }

  .timeline-exams-add {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;

    .ant-select {
      flex: 1;
      min-width: 0;
    }
  }

  .timeline-exams-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .timeline-exam {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: 0;
    }

    .timeline-exam-position {
      width: 20px;
      text-align: right;
    }

    .timeline-exam-name {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 8px;
    }

    .timeline-exam-actions {
      display: flex;
      gap: 2px;
    }
  }

  .timeline-exams-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 24px;
  }
`;

/** The references of a list, to compare lists */
const refsOf = (exams: ITimelineExam[]) =>
  exams.map((exam) => exam.examRef).join(",");

/**
 * The exams the antimicrobial timeline of every admission opens with, in
 * order (a row each, plotted when the patient has results of it): the
 * schema's choice, or the NoHarm default ones while it never chose. Anyone who
 * sees the worklist reads them; only the infection control
 * (WRITE_INFECTION_CONTROL) changes them. A tab of the infection control
 * settings: `onClose` closes the settings
 */
export function TimelineExams({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const canEdit = PermissionService().has(Permission.WRITE_INFECTION_CONTROL);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  // the exams as saved: the default flag, the version replaced, the options
  const [saved, setSaved] = useState<ITimelineExamsSaved | null>(null);
  // the list being edited
  const [exams, setExams] = useState<ITimelineExam[]>([]);

  /** Keeps the exams as saved and edits them from there */
  const keep = (payload: ITimelineExamsSaved) => {
    setSaved(payload);
    setExams(payload.exams);
  };

  /** Fetches the exams (the loading state is set by the caller) */
  const fetchExams = () =>
    (dispatch(fetchTimelineExams()) as Promise<any>).then((response) => {
      setLoading(false);
      if (response.error) {
        setFailed(true);
        return;
      }
      keep(response.payload);
    });

  const load = () => {
    setLoading(true);
    setFailed(false);
    fetchExams();
  };

  // loaded each time the settings open (the modal is destroyed on close)
  useEffect(() => {
    fetchExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const listed = new Set(exams.map((exam) => exam.examRef));
  const options = (saved?.options ?? [])
    .filter((option) => !listed.has(option.examRef))
    .map((option) => ({ value: option.examRef, label: option.name }));
  const full = exams.length >= MAX_EXAMS;

  const add = (examRef: string) => {
    const option = saved?.options.find((item) => item.examRef === examRef);
    if (!option || full) return;
    setExams([...exams, { ...option, available: true }]);
  };

  const move = (index: number, offset: number) => {
    const next = [...exams];
    const [exam] = next.splice(index, 1);
    next.splice(index + offset, 0, exam);
    setExams(next);
  };

  const remove = (index: number) =>
    setExams(exams.filter((_, position) => position !== index));

  const save = () => {
    setSaving(true);
    (
      dispatch(
        saveTimelineExams({ exams: exams.map((exam) => exam.examRef) }),
      ) as Promise<any>
    ).then((response) => {
      setSaving(false);
      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
        return;
      }
      notification.success({
        message: t("infectionControl.timelineExams.saved"),
      });
      keep(response.payload);
    });
  };

  const renderList = (items: ITimelineExam[], editable: boolean) =>
    items.length ? (
      <ol className="timeline-exams-list">
        {items.map((exam, index) => (
          <li
            key={exam.examRef}
            className="timeline-exam"
            data-testid="timeline-exam"
          >
            <span className="timeline-exam-position muted">{index + 1}.</span>
            <span className="timeline-exam-name">
              <span>{exam.name}</span>
              {!exam.available && (
                <Tag color="warning">
                  {t("infectionControl.timelineExams.unavailable")}
                </Tag>
              )}
            </span>
            {editable && (
              <span className="timeline-exam-actions">
                <Tooltip title={t("infectionControl.timelineExams.moveUp")}>
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    aria-label={t("infectionControl.timelineExams.moveUp")}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  />
                </Tooltip>
                <Tooltip title={t("infectionControl.timelineExams.moveDown")}>
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    aria-label={t("infectionControl.timelineExams.moveDown")}
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 1)}
                  />
                </Tooltip>
                <Tooltip title={t("infectionControl.timelineExams.remove")}>
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    aria-label={t("infectionControl.timelineExams.remove")}
                    onClick={() => remove(index)}
                  />
                </Tooltip>
              </span>
            )}
          </li>
        ))}
      </ol>
    ) : (
      <span className="muted">{t("infectionControl.timelineExams.none")}</span>
    );

  const previous = saved?.previous;
  const isDefaultList = !!saved && refsOf(exams) === refsOf(saved.defaultExams);

  return (
    <Body
      data-kb="infectionControl.timelineExams.modal"
      data-testid="timeline-exams"
    >
      <div className="timeline-exams-description muted">
        {t("infectionControl.timelineExams.description")}
      </div>

      {loading ? (
        <div className="timeline-exams-loading">
          <Spin />
        </div>
      ) : failed || !saved ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("infectionControl.timelineExams.loadError")}
        >
          <Button onClick={load}>{t("infectionControl.retry")}</Button>
        </Empty>
      ) : (
        <>
          {saved.default && (
            <Alert
              className="timeline-exams-notice"
              type="info"
              showIcon
              title={t("infectionControl.timelineExams.defaultNotice")}
            />
          )}
          {!canEdit && (
            <Alert
              className="timeline-exams-notice"
              type="info"
              showIcon
              title={t("infectionControl.timelineExams.readOnly")}
            />
          )}

          {canEdit && (
            <div className="timeline-exams-add">
              <Select<string | null>
                aria-label={t("infectionControl.timelineExams.add")}
                placeholder={
                  full
                    ? t("infectionControl.timelineExams.max", {
                        max: MAX_EXAMS,
                      })
                    : t("infectionControl.timelineExams.add")
                }
                value={null}
                disabled={full}
                showSearch
                optionFilterProp="label"
                onSelect={(value) => value && add(value)}
                options={options}
              />
              {!isDefaultList && (
                <Button onClick={() => setExams(saved.defaultExams)}>
                  {t("infectionControl.timelineExams.restoreDefault")}
                </Button>
              )}
            </div>
          )}

          {renderList(exams, canEdit)}

          <SettingVersions
            current={saved}
            previous={previous}
            renderPrevious={() => previous && renderList(previous.exams, false)}
          />

          <div className="timeline-exams-footer">
            <Button onClick={onClose}>{t("actions.close")}</Button>
            {canEdit && (
              <Button type="primary" loading={saving} onClick={save}>
                {t("actions.save")}
              </Button>
            )}
          </div>
        </>
      )}
    </Body>
  );
}
