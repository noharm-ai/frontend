import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { escape } from "lodash";
import DOMPurify from "dompurify";
import { useNavigate } from "react-router-dom";
import { Space, FloatButton, Tabs } from "antd";
import {
  UnorderedListOutlined,
  QuestionOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";

import { useAppDispatch, useAppSelector } from "src/store";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { FloatButtonGroup } from "components/FloatButton";
import { PageHeader } from "styles/PageHeader.style";
import {
  ReportContainer,
  ReportHeader,
  ReportFilterContainer,
} from "styles/Report.style";
// @ts-expect-error missing types
import { NoHarmLogoHorizontal as Brand } from "assets/NoHarmLogoHorizontal";
import {
  onBeforePrint,
  onAfterPrint,
  filtersToDescription,
} from "src/utils/report";
import { FeatureService } from "services/FeatureService";
import Feature from "models/Feature";

import {
  fetchReportData,
  setHelpModal,
} from "./InfectionControlConsolidatedReportSlice";
import { ReportTabs } from "./InfectionControlConsolidatedReport.style";
import {
  IFilterValues,
  IIndicators,
  IReportParams,
} from "./infectionControlReportTypes";
import { Filter } from "./Filter/Filter";
import { HelpModal } from "./Help/Help";
import { Conformity } from "./Sections/Conformity/Conformity";
import { DotLot } from "./Sections/DotLot/DotLot";
import { Departments } from "./Sections/Departments/Departments";
import { Reviews } from "./Sections/Reviews/Reviews";
import { Consumption } from "./Sections/Consumption/Consumption";
import { Microbiology } from "./Sections/Microbiology/Microbiology";
import { Outcomes } from "./Sections/Outcomes/Outcomes";

// names typed elsewhere (substances, users, departments) go into the printed
// filter list as HTML, so they are escaped
interface IDepartment {
  idDepartment: number;
  label: string;
}

const labels = (list?: { label: string }[]) =>
  (list || []).map((item) => escape(item.label)).join(", ");

const values = (list?: { value: number }[]) =>
  (list || []).map((item) => item.value);

// up to yesterday, the last complete day of the files
const yesterday = () => dayjs().subtract(1, "day");

// the period is set when the page opens
const INITIAL_VALUES: Omit<IFilterValues, "dateRange"> = {
  segment: [],
  department: [],
  aware_level: [],
  substance: [],
  reviewer: [],
};

/**
 * Infection control report: the indicators of a period (conformity and
 * reviews, DOT/LOT, consumption, microbiology and outcomes),
 * read from the files the long-running tasks build every night.
 */
export function InfectionControlConsolidatedReport() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const printRef = useRef(null);
  const status = useAppSelector(
    (state) => state.reportsArea.infectionControlConsolidated.filtered.status,
  );
  const result = useAppSelector(
    (state) => state.reportsArea.infectionControlConsolidated.filtered.result,
  );
  const departments: IDepartment[] = useAppSelector(
    (state) => state.lists.getSegmentDepartments.list,
  );
  const [description, setDescription] = useState<Record<string, unknown>>({});
  // the request behind the indicators on screen, repeated by the drill-down
  const [periodParams, setPeriodParams] = useState<IReportParams | null>(null);
  const [initialValues] = useState<IFilterValues>(() => ({
    ...INITIAL_VALUES,
    dateRange: [yesterday().startOf("year"), yesterday()],
  }));
  const isLoading = status === "loading";
  const indicators: Partial<IIndicators> = result?.indicators || {};
  const hideNames = FeatureService.has(Feature.HIDE_NAMES);
  const tk = (key: string) => t(`infectionControlConsolidated.${key}`);

  const filtersConfig = {
    period: { label: tk("filter.period"), type: "range" },
    segment: { label: tk("filter.segment"), type: "list" },
    department: { label: tk("filter.department"), type: "list" },
    aware_level: { label: tk("filter.aware"), type: "list" },
    substance: { label: tk("filter.substance"), type: "list" },
    reviewer: { label: tk("filter.reviewer"), type: "list", mask: hideNames },
  };

  // the indicators of the period
  const fetchPeriod = (params: IFilterValues) => {
    const [start, end] = params.dateRange;
    const apiParams: IReportParams = {
      id_department: params.department,
      segment: params.segment,
      substance: values(params.substance),
      aware_level: params.aware_level,
      year: start.year(),
      start_date: start.format("YYYY-MM-DD"),
      end_date: end.format("YYYY-MM-DD"),
      reviewer: values(params.reviewer),
    };

    // the store middlewares leave the thunk result untyped
    dispatch(fetchReportData(apiParams)).then((response: unknown) => {
      if (fetchReportData.rejected.match(response)) {
        notification.error({
          message: tk("loadError"),
          description:
            (response.payload as { message?: string })?.message ||
            tk("unexpectedError"),
        });
        return;
      }

      setPeriodParams(apiParams);
      setDescription({
        period: [start, end],
        segment: params.segment.map((s) => escape(s)).join(", "),
        department: params.department
          .map((id) =>
            escape(
              departments.find((d) => d.idDepartment === id)?.label ?? `${id}`,
            ),
          )
          .join(", "),
        aware_level: params.aware_level
          .map((level) => t(`culture.awareLevel.${level}`))
          .join(", "),
        substance: labels(params.substance),
        reviewer: labels(params.reviewer),
      });
    });
  };

  const onSearch = (params: IFilterValues) => {
    const [start, end] = params.dateRange || [];
    if (!start || !end || start.year() !== end.year()) {
      DefaultModal.error({
        title: tk("invalidPeriod"),
        content: tk("invalidPeriodDescription"),
      });
      return;
    }

    fetchPeriod(params);
  };

  useEffect(() => {
    fetchPeriod(initialValues);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onBeforePrint: onBeforePrint,
    onAfterPrint: onAfterPrint,
  });

  return (
    <>
      <PageHeader>
        <div>
          <h1
            className="page-header-title"
            data-kb="reports.infectionControl.title"
          >
            {tk("title")}
            <Tooltip title={tk("info")}>
              <Button
                type="primary"
                shape="circle"
                icon={<QuestionOutlined />}
                loading={isLoading}
                onClick={() => dispatch(setHelpModal(true))}
              />
            </Tooltip>
          </h1>
          <div className="page-header-legend">{tk("legend")}</div>
        </div>
        <div className="page-header-actions">
          <Button
            type="default"
            icon={<UnorderedListOutlined />}
            onClick={() => navigate("/relatorios")}
          >
            {tk("allReports")}
          </Button>
        </div>
      </PageHeader>

      <ReportContainer>
        <Filter
          onSearch={onSearch}
          loading={isLoading}
          initialValues={initialValues}
        />

        <div ref={printRef}>
          <ReportHeader className="report-header">
            <h1>{tk("title")}</h1>
            <div className="brand">
              <Brand />
            </div>
          </ReportHeader>

          <ReportFilterContainer>
            <div
              className="report-filter-list"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  filtersToDescription(description, filtersConfig),
                ),
              }}
            ></div>
          </ReportFilterContainer>

          {/* only the open pane is mounted, so its charts are drawn with
              their width: a hidden pane redrawn by a new search would keep
              the width of a hidden element. Printing prints the open one */}
          <ReportTabs>
            <Tabs
              data-kb="reports.infectionControl.tabs"
              destroyOnHidden
              items={[
                {
                  key: "conformity",
                  label: tk("conformity.title"),
                  children: (
                    <Space
                      orientation="vertical"
                      size={24}
                      style={{ width: "100%" }}
                    >
                      <Conformity
                        overview={indicators.overview}
                        appropriateness={indicators.appropriateness}
                        monthly={indicators.monthly}
                        daily={indicators.daily}
                        loading={isLoading}
                      />
                      <Departments
                        view="conformity"
                        departments={indicators.byDepartment}
                        params={periodParams}
                        loading={isLoading}
                      />
                    </Space>
                  ),
                },
                {
                  key: "reviews",
                  label: tk("process.title"),
                  children: (
                    <Space
                      orientation="vertical"
                      size={24}
                      style={{ width: "100%" }}
                    >
                      <Reviews
                        overview={indicators.overview}
                        process={indicators.process}
                        loading={isLoading}
                      />
                      <Departments
                        view="reviews"
                        departments={indicators.byDepartment}
                        params={periodParams}
                        loading={isLoading}
                      />
                    </Space>
                  ),
                },
                {
                  key: "dotLot",
                  label: tk("dotLot.title"),
                  children: (
                    <Space
                      orientation="vertical"
                      size={24}
                      style={{ width: "100%" }}
                    >
                      <DotLot
                        overview={indicators.overview}
                        consumption={indicators.consumption}
                        monthlyUse={indicators.monthlyUse}
                        loading={isLoading}
                      />
                      <Departments
                        view="dotLot"
                        departments={indicators.byDepartment}
                        params={periodParams}
                        loading={isLoading}
                      />
                    </Space>
                  ),
                },
                {
                  key: "consumption",
                  label: tk("consumption.title"),
                  children: (
                    <Consumption
                      consumption={indicators.consumption}
                      loading={isLoading}
                    />
                  ),
                },
                {
                  key: "microbiology",
                  label: tk("microbiology.title"),
                  children: (
                    <Microbiology
                      microbiology={indicators.microbiology}
                      loading={isLoading}
                    />
                  ),
                },
                {
                  key: "outcomes",
                  label: tk("outcomes.title"),
                  children: (
                    <Outcomes
                      outcomes={indicators.outcomes}
                      loading={isLoading}
                    />
                  ),
                },
              ]}
            />
          </ReportTabs>
        </div>
      </ReportContainer>
      <HelpModal />
      {!isLoading && (
        <FloatButtonGroup
          trigger="click"
          type="primary"
          icon={<MenuOutlined />}
          tooltip={{ title: tk("menu"), placement: "left" }}
          style={{ bottom: 25 }}
        >
          <FloatButton
            icon={<QuestionCircleOutlined />}
            onClick={() => dispatch(setHelpModal(true))}
            tooltip={{ title: tk("info"), placement: "left" }}
          />
          <FloatButton
            icon={<PrinterOutlined />}
            onClick={() => handlePrint()}
            tooltip={{ title: tk("print"), placement: "left" }}
          />
        </FloatButtonGroup>
      )}
      <FloatButton.BackTop
        style={{ right: 80, bottom: 25 }}
        tooltip={tk("backTop")}
      />
    </>
  );
}
