import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Button, Empty, Tabs, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import FeaturesService from "services/features";
import { usePatientName } from "hooks/usePatientName";
import { formatDate } from "utils/date";
import { CultureReportButton } from "features/culture/CultureReportButton/CultureReportButton";
import { fetchCultures } from "features/culture/CultureSlice";
import { isResistantInUse } from "features/culture/cultureResistance";
import {
  trackInfectionControlAction,
  TrackedInfectionControlAction,
} from "src/utils/tracker";

import {
  fetchRecentCultures,
  ICultureCollection,
  IInfectionControlPatient,
} from "../InfectionControlSlice";
import {
  availableDetails,
  collectionsOf,
  detailOptionsOf,
  filterCollections,
  ICollectionDetails,
  NO_DETAILS,
  prescribedDrugsOf,
} from "./cultureCollections";
import { CultureCollectionDrawer } from "./CultureCollectionDrawer/CultureCollectionDrawer";
import { CultureCollectionList } from "./CultureCollectionList/CultureCollectionList";
import { CulturesByDrug } from "./CulturesByDrug/CulturesByDrug";
import { CulturesBox, CulturesError } from "./InfectionControlCultures.style";

interface InfectionControlCulturesProps {
  admissionNumber: string;
  patient: IInfectionControlPatient;
  // the latest prescription of the admission, whose drugs the cultures by
  // drug flag; without one there are no cultures by drug
  idPrescription: string | null;
  // the collection open in the drawer, by id: the timeline opens them too
  openId: string | null;
  onOpenIdChange: (id: string | null) => void;
}

/**
 * The culture exams of the patient at a glance, in one card: every collection
 * released in the last 60 days, each with the microorganisms it found and
 * their antibiogram summed up, the drugs of the prescription first. Only
 * informative: loaded with the page but apart from it, and a failure stays in
 * here. A collection opens whole in a drawer, which moves through the list.
 *
 * For a schema with the antibiogram integration (models/Feature.CULTURE) the
 * same cultures read by drug (the culture card of the screening) are a tab
 * away, and the full culture report is in the header, beside the tabs. They are loaded with the page, so the tab can say a resistant drug is
 * in use before it is opened
 */
export function InfectionControlCultures({
  admissionNumber,
  patient,
  idPrescription,
  openId,
  onOpenIdChange,
}: InfectionControlCulturesProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { status, data } = useAppSelector(
    (state) => state.infectionControl.cultures,
  );
  const { list: culturesByDrug, status: culturesByDrugStatus } = useAppSelector(
    (state) => state.cultures,
  );
  // the legacy ducks are persisted untyped
  const features = useAppSelector((state: any) => state.user.account.features);
  const { name: patientName } = usePatientName(patient.idPatient);

  const hasByDrug = !!idPrescription && FeaturesService(features).hasCulture();

  const [details, setDetails] = useState<ICollectionDetails>(NO_DETAILS);

  const collections = useMemo(() => collectionsOf(data), [data]);
  // the cultures by drug know which drugs the prescription carries
  const prescribed = useMemo(
    () => prescribedDrugsOf(hasByDrug ? culturesByDrug : null),
    [hasByDrug, culturesByDrug],
  );
  const detailOptions = useMemo(
    () => detailOptionsOf(collections),
    [collections],
  );
  // a secondary filter no longer among the collections (reloaded) is let go
  const activeDetails = useMemo(
    () => availableDetails(details, detailOptions),
    [details, detailOptions],
  );
  // the drawer moves through the list as filtered
  const visible = useMemo(
    () => filterCollections(collections, activeDetails),
    [collections, activeDetails],
  );
  const openCollection =
    collections.find((collection) => collection.id === openId) ?? null;
  // the drawer moves through the list as filtered, or through all of them
  // when it opened one the filters hide (from the timeline)
  const drawerCollections =
    !openCollection || visible.includes(openCollection) ? visible : collections;

  useEffect(() => {
    // the slice skips the request while the cached list is current
    if (hasByDrug && idPrescription) {
      dispatch(fetchCultures({ idPrescription }));
    }
  }, [hasByDrug, idPrescription, culturesByDrugStatus, dispatch]);

  // the fields of the prescription the culture report reads
  const reportPrescription = useMemo(
    () => ({
      idPrescription,
      idPatient: patient.idPatient,
      admissionNumber: patient.admissionNumber,
      namePatient: patientName,
      birthdateFormat: formatDate(patient.birthdate) ?? "",
    }),
    [idPrescription, patient, patientName],
  );

  const resistantInUse = hasByDrug
    ? (culturesByDrug ?? []).filter(isResistantInUse).length
    : 0;

  const openDetails = useCallback(
    (collection: ICultureCollection) => {
      trackInfectionControlAction(
        TrackedInfectionControlAction.OPEN_CULTURE_HISTORY,
      );
      onOpenIdChange(collection.id);
    },
    [onOpenIdChange],
  );

  // moving through the list from the drawer
  const selectCollection = useCallback(
    (collection: ICultureCollection) => onOpenIdChange(collection.id),
    [onOpenIdChange],
  );

  const byExam = (
    <div
      className="culture-pane"
      data-kb="infectionControl.cultures.byExam"
      data-testid="recent-cultures"
    >
      {status === "failed" ? (
        <CulturesError>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("infectionControl.cultures.loadError")}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => dispatch(fetchRecentCultures({ admissionNumber }))}
          >
            {t("infectionControl.retry")}
          </Button>
        </CulturesError>
      ) : (
        <CultureCollectionList
          collections={collections}
          loading={status === "loading" || status === "idle"}
          prescribed={prescribed}
          details={activeDetails}
          detailOptions={detailOptions}
          onDetailsChange={setDetails}
          onOpen={openDetails}
        />
      )}
    </div>
  );

  const title = (
    <h2 className="section-title">{t("infectionControl.cultures.title")}</h2>
  );

  return (
    <CulturesBox>
      {hasByDrug && idPrescription ? (
        <Tabs
          defaultActiveKey="summary"
          tabBarExtraContent={{
            left: title,
            // the full report, whichever view is open
            right: <CultureReportButton prescription={reportPrescription} />,
          }}
          items={[
            {
              key: "summary",
              label: t("infectionControl.cultures.summary"),
              children: byExam,
            },
            {
              key: "byDrug",
              label:
                resistantInUse > 0 ? (
                  // a resistance the patient is being given is not left for
                  // the user to find behind the tab
                  <Tooltip
                    title={t("culture.resistantInUseTabHint", {
                      count: resistantInUse,
                    })}
                  >
                    <Badge dot offset={[5, 2]}>
                      <span data-testid="cultures-by-drug-alert">
                        {t("infectionControl.cultures.byDrug")}
                      </span>
                    </Badge>
                  </Tooltip>
                ) : (
                  t("infectionControl.cultures.byDrug")
                ),
              children: (
                <div
                  className="culture-pane by-drug"
                  data-kb="infectionControl.cultures.byDrug"
                  data-testid="cultures-by-drug"
                >
                  <div className="legend">
                    {t("infectionControl.cultures.byDrugLegend")}
                  </div>
                  <CulturesByDrug idPrescription={idPrescription} />
                </div>
              ),
            },
          ]}
        />
      ) : (
        <>
          <div className="cultures-header">{title}</div>
          <div className="cultures-body">{byExam}</div>
        </>
      )}
      <CultureCollectionDrawer
        collections={drawerCollections}
        collection={openCollection}
        prescribed={prescribed}
        onSelect={selectCollection}
        onClose={() => onOpenIdChange(null)}
      />
    </CulturesBox>
  );
}
