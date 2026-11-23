import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, Empty, Select, Spin, Tag } from "antd";
import { debounce } from "lodash";
import styled from "styled-components";

import notification from "components/notification";
import Permission from "models/Permission";
import PermissionService from "services/PermissionService";
import { getErrorMessage } from "utils/errorHandler";
import { useAppDispatch } from "src/store";

import {
  fetchReviewExceptions,
  IReviewExceptionItem,
  IReviewExceptions,
  IReviewExceptionsSaved,
  saveReviewExceptions,
  searchReviewExceptionOptions,
} from "../InfectionControlListSlice";
import { SettingVersions } from "../InfectionControlSettings/SettingVersions/SettingVersions";

// letters typed before the antimicrobials are searched
const MIN_SEARCH = 3;

type ItemType = "substance" | "drug";

const Body = styled.div`
  .exceptions-description {
    margin-bottom: 16px;
  }

  .exceptions-loading {
    display: flex;
    justify-content: center;
    padding: 24px 0;
  }

  .exceptions-group {
    margin-top: 16px;

    h3 {
      font-size: 14px;
      margin-bottom: 8px;
    }
  }

  .exceptions-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .exceptions-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 24px;
  }
`;

/** The option value of a substance or drug in the search */
const optionValue = (type: ItemType, id: string) => `${type}:${id}`;

/** A list sorted by name, as the backend sorts it */
const byName = (items: IReviewExceptionItem[]) =>
  [...items].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

/**
 * The antimicrobials whose courses need no infection control review (the
 * schema's review exceptions): a substance covers every drug of it, a drug
 * (any antimicrobial, with a substance or not) covers only itself. Their
 * courses still count as
 * antimicrobial therapy (DOT/LOT), but open no pending reason and stay out of
 * the review indicators; the patients running only them leave the worklist,
 * unless the filter asks for them. Anyone who sees the worklist reads the
 * list; only the infection control (WRITE_INFECTION_CONTROL) changes it.
 * A tab of the infection control settings: `onSaved` reloads the worklist,
 * `onClose` closes the settings
 */
export function ReviewExceptions({
  onSaved,
  onClose,
}: {
  onSaved: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const canEdit = PermissionService().has(Permission.WRITE_INFECTION_CONTROL);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [substances, setSubstances] = useState<IReviewExceptionItem[]>([]);
  const [drugs, setDrugs] = useState<IReviewExceptionItem[]>([]);
  // the list as saved: when and by whom, and the version it replaced
  const [saved, setSaved] = useState<IReviewExceptionsSaved | null>(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [found, setFound] = useState<IReviewExceptions>({
    substances: [],
    drugs: [],
  });

  /** Fetches the list (the loading state is set by the caller) */
  const fetchList = () =>
    (dispatch(fetchReviewExceptions()) as Promise<any>).then((response) => {
      setLoading(false);
      if (response.error) {
        setFailed(true);
        return;
      }
      setSaved(response.payload);
      setSubstances(response.payload.substances);
      setDrugs(response.payload.drugs);
    });

  const load = () => {
    setLoading(true);
    setFailed(false);
    fetchList();
  };

  // loaded each time the settings open (the modal is destroyed on close)
  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = useMemo(
    () =>
      debounce((term: string) => {
        if (term.trim().length < MIN_SEARCH) return;

        setSearching(true);
        (
          dispatch(
            searchReviewExceptionOptions({ term: term.trim() }),
          ) as Promise<any>
        ).then((response) => {
          setFound(
            response.error
              ? { substances: [], drugs: [] }
              : (response.payload as IReviewExceptions),
          );
          setSearching(false);
          setSearched(true);
        });
      }, 600),
    [dispatch],
  );
  useEffect(() => () => search.cancel(), [search]);

  const listed = new Set([
    ...substances.map((item) => optionValue("substance", item.id)),
    ...drugs.map((item) => optionValue("drug", item.id)),
  ]);
  const toOptions = (type: ItemType, items: IReviewExceptionItem[]) =>
    items
      .filter((item) => !listed.has(optionValue(type, item.id)))
      .map((item) => ({
        value: optionValue(type, item.id),
        label: item.name,
      }));
  const options = [
    {
      label: t("infectionControl.reviewExceptions.substances"),
      options: toOptions("substance", found.substances),
    },
    {
      label: t("infectionControl.reviewExceptions.drugs"),
      options: toOptions("drug", found.drugs),
    },
  ].filter((group) => group.options.length);

  const add = (value: string) => {
    const [type, id] = value.split(":") as [ItemType, string];
    const source = type === "substance" ? found.substances : found.drugs;
    const item = source.find((option) => option.id === id);
    if (!item) return;

    if (type === "substance") setSubstances(byName([...substances, item]));
    else setDrugs(byName([...drugs, item]));
  };

  const remove = (type: ItemType, id: string) => {
    if (type === "substance")
      setSubstances(substances.filter((item) => item.id !== id));
    else setDrugs(drugs.filter((item) => item.id !== id));
  };

  const save = () => {
    setSaving(true);
    (
      dispatch(
        saveReviewExceptions({
          // as strings: a sctid can be longer than a number holds exactly
          substances: substances.map((item) => item.id),
          drugs: drugs.map((item) => item.id),
        }),
      ) as Promise<any>
    ).then((response) => {
      setSaving(false);
      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
        return;
      }
      notification.success({
        message: t("infectionControl.reviewExceptions.saved"),
      });
      // stays open on the list as saved, with the version it replaced
      const payload = response.payload as IReviewExceptionsSaved;
      setSaved(payload);
      setSubstances(payload.substances);
      setDrugs(payload.drugs);
      onSaved();
    });
  };

  const renderGroup = (
    type: ItemType,
    title: string,
    items: IReviewExceptionItem[],
    editable = canEdit,
  ) => (
    <div className="exceptions-group">
      <h3>{title}</h3>
      {items.length ? (
        <div className="exceptions-tags">
          {items.map((item) => (
            <Tag
              key={item.id}
              closable={editable}
              onClose={(event) => {
                event.preventDefault();
                remove(type, item.id);
              }}
            >
              {item.name ?? item.id}
            </Tag>
          ))}
        </div>
      ) : (
        <span className="muted">
          {t("infectionControl.reviewExceptions.none")}
        </span>
      )}
    </div>
  );

  const previous = saved?.previous;

  return (
    <Body
      data-kb="infectionControl.reviewExceptions.modal"
      data-testid="review-exceptions"
    >
      <div className="exceptions-description muted">
        {t("infectionControl.reviewExceptions.description")}
      </div>

      {loading ? (
        <div className="exceptions-loading">
          <Spin />
        </div>
      ) : failed ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("infectionControl.reviewExceptions.loadError")}
        >
          <Button onClick={load}>{t("infectionControl.retry")}</Button>
        </Empty>
      ) : (
        <>
          {canEdit ? (
            <Select<string | null>
              style={{ width: "100%" }}
              aria-label={t("infectionControl.reviewExceptions.add")}
              placeholder={t("infectionControl.reviewExceptions.add")}
              value={null}
              loading={searching}
              showSearch
              filterOption={false}
              onSearch={search}
              onSelect={(value) => value && add(value)}
              options={options}
              notFoundContent={
                searched && !searching
                  ? t("infectionControl.reviewExceptions.notFound")
                  : null
              }
            />
          ) : (
            <Alert
              type="info"
              showIcon
              title={t("infectionControl.reviewExceptions.readOnly")}
            />
          )}

          {renderGroup(
            "substance",
            t("infectionControl.reviewExceptions.substances"),
            substances,
          )}
          {renderGroup(
            "drug",
            t("infectionControl.reviewExceptions.drugs"),
            drugs,
          )}

          <SettingVersions
            current={saved}
            previous={previous}
            renderPrevious={() =>
              previous && (
                <>
                  {renderGroup(
                    "substance",
                    t("infectionControl.reviewExceptions.substances"),
                    previous.substances,
                    false,
                  )}
                  {renderGroup(
                    "drug",
                    t("infectionControl.reviewExceptions.drugs"),
                    previous.drugs,
                    false,
                  )}
                </>
              )
            }
          />

          <div className="exceptions-footer">
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
