import React, { useEffect, useRef } from "react";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { FloatButton, Skeleton } from "antd";

import Empty from "components/Empty";
import LoadBox, { LoadContainer } from "components/LoadBox";
import { Row, Col } from "components/Grid";
import Tag from "components/Tag";
import notification from "components/notification";
import FeatureService from "services/features";
import PermissionService from "services/PermissionService";
import PrescriptionList from "containers/Screening/PrescriptionDrug/PrescriptionList";
import SolutionList from "containers/Screening/PrescriptionDrug/SolutionList";
import ProcedureList from "containers/Screening/PrescriptionDrug/ProcedureList";
import DietList from "containers/Screening/PrescriptionDrug/DietList";
import PreviousInterventionList from "containers/Screening/PreviousInterventionList";
import PageHeader from "containers/Screening/PageHeader";
import Patient from "containers/Screening/Patient";
import PrescriptionDrugForm from "containers/Forms/PrescriptionDrug";
import DrugFormStatus from "features/drugs/DrugFormStatus/DrugFormStatus";
import ScreeningActions from "containers/Screening/ScreeningActions";
import EvaluationWarning from "features/prescription/EvaluationWarning/EvaluationWarning";
import FormIntervention from "containers/Forms/Intervention";
import Permission from "models/Permission";
import {
  trackPrescriptionAction,
  TrackedPrescriptionAction,
} from "src/utils/tracker";

import { ScreeningTabs, DrugFormStatusBox } from "./index.style";

export default function Screening({
  fetchScreeningById,
  isFetching,
  content,
  error,
  interventions,
  features,
  permissions,
}) {
  const params = useParams();
  const id = params?.slug;
  const { prescriptionCount, solutionCount, proceduresCount, dietCount } =
    content;

  const { t } = useTranslation();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  const featureService = FeatureService(features);
  const permissionService = PermissionService(permissions);

  // show message if has error
  useEffect(() => {
    if (!isMounted.current) return;

    if (!isEmpty(error)) {
      notification.error({
        message: t("error.title"),
        description: t("error.description"),
      });
    }
  }, [error, t]);

  useEffect(() => {
    const getNextSibling = (elm) => {
      const allRows = document.querySelectorAll(
        ".ant-tabs-tabpane:not(.ant-tabs-tabpane-hidden) .ant-table-tbody tr[data-row-key]:not(.summary-row):not(.divider-row)"
      );

      let currentIndex = -1;
      allRows.forEach((i, index) => {
        if (
          i.getAttribute("data-row-key") === elm.getAttribute("data-row-key")
        ) {
          currentIndex = index;
        }
      });

      if (currentIndex !== -1) {
        return allRows[currentIndex + 1] || elm;
      }

      return elm;
    };

    const getPreviousSibling = (elm) => {
      const allRows = document.querySelectorAll(
        ".ant-tabs-tabpane:not(.ant-tabs-tabpane-hidden) .ant-table-tbody tr[data-row-key]:not(.summary-row):not(.divider-row)"
      );

      let currentIndex = -1;
      allRows.forEach((i, index) => {
        if (
          i.getAttribute("data-row-key") === elm.getAttribute("data-row-key")
        ) {
          currentIndex = index;
        }
      });

      if (currentIndex !== -1) {
        return allRows[currentIndex - 1] || elm;
      }

      return elm;
    };

    const scrollIntoView = (elm) => {
      const y = elm.getBoundingClientRect().top + window.pageYOffset - 60;

      window.scrollTo({ top: y, behavior: "smooth" });
    };

    const handleArrowNav = (e) => {
      if (!isMounted.current) {
        return;
      }

      const keyCode = e.keyCode || e.which;
      const actionKey = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        space: 32,
        enter: 13,
        plus: 107,
        backspace: 8,
      };

      if (document.querySelectorAll(".ant-modal-mask").length) {
        // if modal active, do nothing
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        let activeRow = document.querySelectorAll(
          ".ant-tabs-tabpane:not(.ant-tabs-tabpane-hidden) .ant-table-tbody tr.highlight"
        )[0];
        if (!activeRow) {
          activeRow = document.querySelectorAll(
            ".ant-tabs-tabpane:not(.ant-tabs-tabpane-hidden) .ant-table-tbody tr"
          )[0];

          activeRow?.classList.add("highlight");

          return;
        }

        const expandBtn = activeRow?.querySelector(
          ".ant-table-row-expand-icon"
        );

        trackPrescriptionAction(TrackedPrescriptionAction.KEYBOARD_NAVIGATION, {
          title: keyCode,
        });

        switch (keyCode) {
          case actionKey.up: {
            e.preventDefault();
            activeRow.classList.remove("highlight");
            const previousElm = getPreviousSibling(activeRow);
            previousElm.classList.add("highlight");
            previousElm
              .querySelector(".ant-table-row-expand-icon")
              ?.focus({ preventScroll: true });

            setTimeout(() => {
              scrollIntoView(previousElm);
            }, 50);

            break;
          }
          case actionKey.down: {
            e.preventDefault();
            activeRow.classList.remove("highlight");
            const nextElm = getNextSibling(activeRow);
            nextElm.classList.add("highlight");

            nextElm
              .querySelector(".ant-table-row-expand-icon")
              ?.focus({ preventScroll: true });

            setTimeout(() => {
              scrollIntoView(nextElm);
            }, 50);

            break;
          }
          case actionKey.right:
            e.preventDefault();
            if (
              expandBtn.classList.contains("ant-table-row-expand-icon-expanded")
            ) {
              activeRow.nextElementSibling
                .querySelector("input:not(:disabled)")
                ?.select();
            } else {
              expandRowClick(activeRow);
            }

            break;
          case actionKey.left:
            e.preventDefault();
            if (
              expandBtn.classList.contains("ant-table-row-expand-icon-expanded")
            ) {
              expandBtn.click();
            }

            break;
          case actionKey.backspace: {
            e.preventDefault();
            activeRow.classList.remove("highlight");
            const first = document.querySelectorAll(
              ".ant-tabs-tabpane:not(.ant-tabs-tabpane-hidden) .ant-table-tbody tr"
            )[0];
            first.classList.add("highlight");
            scrollIntoView(first);
            first
              .querySelector(".ant-table-row-expand-icon")
              ?.focus({ preventScroll: true });

            break;
          }
          case actionKey.enter:
            e.preventDefault();
            document
              .querySelectorAll(
                ".ant-collapse-item:not(.ant-collapse-item-active)"
              )
              .forEach((p) => p.children[0].click());

            setTimeout(() => {
              document
                .querySelectorAll(
                  ".expand-all.ant-table-row-expand-icon-collapsed"
                )
                .forEach((p) => p.click());
            }, 100);

            break;
          default:
            console.debug("keyCode", keyCode);
        }
      }
    };

    if (!isMounted.current) return;

    window.addEventListener("keydown", handleArrowNav);
    return () => {
      isMounted.current = false;
      window.removeEventListener("keydown", handleArrowNav);
    };
  }, []);

  const expandRowClick = (activeRow) => {
    activeRow.querySelector(".ant-table-row-expand-icon").click();

    setTimeout(() => {
      activeRow.nextElementSibling
        .querySelector("input:not(:disabled)")
        ?.select();
    }, 100);
  };

  const listCount = {
    prescriptions: prescriptionCount,
    solutions: solutionCount,
    procedures: proceduresCount,
    diet: dietCount,
    interventions: interventions
      ? interventions.filter((i) => i.status !== "0").length
      : 0,
  };

  const fixedTabs = 2;
  const tabCount =
    fixedTabs +
    (listCount.procedures > 0 ? 1 : 0) +
    (listCount.diet > 0 ? 1 : 0);

  // fetch data
  useEffect(() => {
    if (!isMounted.current) return;

    fetchScreeningById(id);
  }, [id, fetchScreeningById]);

  const TabTitle = ({ title, count, ...props }) => (
    <>
      <span style={{ marginRight: "10px" }}>{title}</span>
      {count >= 0 ? <Tag {...props}>{count}</Tag> : null}
    </>
  );

  if (error) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={error.message}
        id="gtm-prescription-error"
      />
    );
  }

  const tabs = [
    {
      key: "drugs",
      label: (
        <TabTitle
          title={t("screeningBody.tabDrugs")}
          count={listCount.prescriptions}
        />
      ),
      children: (
        <Col span={24} md={24} style={{ paddingTop: "20px" }}>
          <PrescriptionList
            emptyMessage="Nenhum medicamento encontrado."
            hasFilter
            listType="prescription"
          />
        </Col>
      ),
    },
  ];

  if (!featureService.hasDisableSolutionTab()) {
    tabs.push({
      key: "solutions",
      label: (
        <TabTitle
          title={t("screeningBody.tabSolutions")}
          count={listCount.solutions}
        />
      ),
      children: (
        <Col span={24} md={24} style={{ paddingTop: "20px" }}>
          <SolutionList
            emptyMessage="Nenhuma solução encontrada."
            hasFilter={false}
            listType="solution"
          />
        </Col>
      ),
    });
  }

  if (listCount.procedures > 0) {
    tabs.push({
      key: "procedures",
      label: (
        <TabTitle
          title={t("screeningBody.tabProcedures")}
          count={listCount.procedures}
        />
      ),
      children: (
        <Col span={24} md={24} style={{ paddingTop: "20px" }}>
          <ProcedureList
            emptyMessage="Nenhum procedimento encontrado."
            hasFilter={false}
            listType="procedure"
          />
        </Col>
      ),
    });
  }

  if (listCount.diet > 0) {
    tabs.push({
      key: "diet",
      label: (
        <TabTitle title={t("screeningBody.tabDiet")} count={listCount.diet} />
      ),
      children: (
        <Col span={24} md={24} style={{ paddingTop: "20px" }}>
          <DietList
            emptyMessage="Nenhuma dieta encontrada."
            hasFilter={false}
            listType="diet"
          />
        </Col>
      ),
    });
  }

  tabs.push({
    key: "intervention",
    label: (
      <TabTitle
        title={t("screeningBody.tabInterventions")}
        count={listCount.interventions}
      />
    ),
    children: (
      <div style={{ paddingTop: "20px" }}>
        <PreviousInterventionList />
      </div>
    ),
  });

  const onChangeTab = (activeKey) => {
    switch (activeKey) {
      case "intervention":
        trackPrescriptionAction(TrackedPrescriptionAction.TAB_INTERVENTIONS);
        break;
      case "diet":
        trackPrescriptionAction(TrackedPrescriptionAction.TAB_DIET);
        break;
      case "procedures":
        trackPrescriptionAction(TrackedPrescriptionAction.TAB_PROCEDURES);
        break;
      case "solutions":
        trackPrescriptionAction(TrackedPrescriptionAction.TAB_SOLUTIONS);
        break;
      case "drugs":
        trackPrescriptionAction(TrackedPrescriptionAction.TAB_DRUGS);
        break;
    }
  };

  return (
    <>
      <EvaluationWarning />
      <PageHeader />
      <Skeleton title paragraph={false} loading={isFetching} active />

      {isFetching ? (
        <LoadContainer>
          <LoadBox $absolute={true} />
        </LoadContainer>
      ) : (
        <Patient interventionCount={listCount.interventions} />
      )}

      <Row type="flex" gutter={24}>
        <ScreeningTabs
          defaultActiveKey="1"
          style={{ width: "100%", padding: "10px", marginTop: "10px" }}
          type="card"
          className={`breaktab-${tabCount}`}
          items={tabs}
          onChange={onChangeTab}
        ></ScreeningTabs>
      </Row>

      <PrescriptionDrugForm />
      {featureService.hasPresmedForm() &&
        permissionService.has(Permission.READ_DISPENSATION) &&
        !isFetching && (
          <DrugFormStatusBox>
            <DrugFormStatus
              title={content.formTemplate?.name}
              template={content.formTemplate}
            />
          </DrugFormStatusBox>
        )}

      <FormIntervention />
      <ScreeningActions />

      <FloatButton.BackTop
        style={{ right: 80, bottom: 25 }}
        tooltip="Voltar ao topo"
      />
    </>
  );
}
