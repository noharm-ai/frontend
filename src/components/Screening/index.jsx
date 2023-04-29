import React, { useEffect } from "react";
import isEmpty from "lodash.isempty";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { PlusOutlined, CopyOutlined } from "@ant-design/icons";

import Empty from "components/Empty";
import LoadBox, { LoadContainer } from "components/LoadBox";
import { Row, Col } from "components/Grid";
import Tabs from "components/Tabs";
import Tag from "components/Tag";
import notification from "components/notification";
import BackTop from "components/BackTop";
import Dropdown from "components/Dropdown";
import Menu from "components/Menu";

import PrescriptionList from "containers/Screening/PrescriptionDrug/PrescriptionList";
import SolutionList from "containers/Screening/PrescriptionDrug/SolutionList";
import ProcedureList from "containers/Screening/PrescriptionDrug/ProcedureList";
import DietList from "containers/Screening/PrescriptionDrug/DietList";
import PreviousInterventionList from "containers/Screening/PreviousInterventionList";
import PageHeader from "containers/Screening/PageHeader";
import Patient from "containers/Screening/Patient";
import PrescriptionDrugForm from "containers/Forms/PrescriptionDrug";

import {
  BoxWrapper,
  ScreeningTabs,
  PrescriptionActionContainer,
} from "./index.style";

export default function Screening({
  fetchScreeningById,
  isFetching,
  content,
  error,
  selectPrescriptionDrug,
  security,
}) {
  const params = useParams();
  const id = params?.slug;
  const {
    prescriptionCount,
    solutionCount,
    proceduresCount,
    dietCount,
    interventionsRaw: interventionList,
    agg,
  } = content;

  const { t } = useTranslation();

  // show message if has error
  useEffect(() => {
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

    const handleArrowNav = (e) => {
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

      if (e.ctrlKey) {
        let activeRow = document.querySelectorAll(
          ".ant-tabs-tabpane:not(.ant-tabs-tabpane-hidden) .ant-table-tbody tr.highlight"
        )[0];
        if (!activeRow) {
          activeRow = document.querySelectorAll(
            ".ant-tabs-tabpane:not(.ant-tabs-tabpane-hidden) .ant-table-tbody tr"
          )[0];
          activeRow.classList.add("highlight");

          return;
        }

        const expandBtn = activeRow.querySelector(".ant-table-row-expand-icon");

        switch (keyCode) {
          case actionKey.up:
            activeRow.classList.remove("highlight");
            const previousElm = getPreviousSibling(activeRow);
            previousElm.classList.add("highlight");
            previousElm.scrollIntoView({ behavior: "smooth" });
            previousElm
              .querySelector(".ant-table-row-expand-icon")
              ?.focus({ preventScroll: true });

            break;
          case actionKey.down:
            activeRow.classList.remove("highlight");
            const nextElm = getNextSibling(activeRow);
            nextElm.classList.add("highlight");
            nextElm.scrollIntoView({ behavior: "smooth" });
            nextElm
              .querySelector(".ant-table-row-expand-icon")
              ?.focus({ preventScroll: true });

            break;
          case actionKey.right:
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
            if (
              expandBtn.classList.contains("ant-table-row-expand-icon-expanded")
            ) {
              expandBtn.click();
            }

            break;
          case actionKey.backspace:
            activeRow.classList.remove("highlight");
            const first = document.querySelectorAll(
              ".ant-tabs-tabpane:not(.ant-tabs-tabpane-hidden) .ant-table-tbody tr"
            )[0];
            first.classList.add("highlight");
            first.scrollIntoView({ behavior: "smooth" });
            first
              .querySelector(".ant-table-row-expand-icon")
              ?.focus({ preventScroll: true });

            break;
          case actionKey.enter:
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

    window.addEventListener("keydown", handleArrowNav);
    return () => {
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
    interventions: interventionList ? interventionList.length : 0,
  };

  const fixedTabs = 2;
  const tabCount =
    fixedTabs +
    (listCount.procedures > 0 ? 1 : 0) +
    (listCount.diet > 0 ? 1 : 0);

  // fetch data
  useEffect(() => {
    fetchScreeningById(id);
  }, [id, fetchScreeningById]);

  const TabTitle = ({ title, count, ...props }) => (
    <>
      <span style={{ marginRight: "10px" }}>{title}</span>
      {count >= 0 ? <Tag {...props}>{count}</Tag> : null}
    </>
  );

  const addPrescriptionDrug = (source) => {
    selectPrescriptionDrug({
      idPrescription: content.idPrescription,
      idSegment: content.idSegment,
      idHospital: content.idHospital,
      source,
      updateDrug: true,
    });
  };

  const copyPrescriptionDrug = (e, source) => {
    selectPrescriptionDrug({
      idPrescription: content.idPrescription,
      idSegment: content.idSegment,
      idHospital: content.idHospital,
      source,
      copyDrugs: true,
    });

    e.preventDefault();
  };

  const menu = (
    <Menu
      items={[
        {
          label: (
            <div onClick={(e) => copyPrescriptionDrug(e, "prescription")}>
              Copiar de prescrições anteriores
            </div>
          ),
          key: "1",
          icon: <CopyOutlined />,
        },
      ]}
    ></Menu>
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

  return (
    <>
      <BoxWrapper>
        <PageHeader />
        <Row type="flex" gutter={24}>
          <Col span={24} md={24}>
            {isFetching ? (
              <LoadContainer>
                <LoadBox absolute={true} />
              </LoadContainer>
            ) : (
              <Patient interventionCount={listCount.interventions} />
            )}
          </Col>
        </Row>
      </BoxWrapper>

      <Row type="flex" gutter={24}>
        <ScreeningTabs
          defaultActiveKey="1"
          style={{ width: "100%", padding: "10px", marginTop: "10px" }}
          type="card"
          className={`breaktab-${tabCount}`}
        >
          <Tabs.TabPane
            tab={
              <TabTitle
                title={t("screeningBody.tabDrugs")}
                count={listCount.prescriptions}
              />
            }
            key="drugs"
          >
            <Col span={24} md={24} style={{ paddingTop: "20px" }}>
              {!isEmpty(content) && security.hasPrescriptionEdit() && !agg && (
                <PrescriptionActionContainer>
                  <Dropdown.Button
                    overlay={menu}
                    onClick={() => addPrescriptionDrug("prescription")}
                    className="gtm-bt-add-drugEdit"
                  >
                    <PlusOutlined />
                    {t("screeningBody.btnAddDrug")}
                  </Dropdown.Button>
                </PrescriptionActionContainer>
              )}

              <PrescriptionList
                emptyMessage="Nenhum medicamento encontrado."
                hasFilter
                listType="prescription"
              />
            </Col>
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <TabTitle
                title={t("screeningBody.tabSolutions")}
                count={listCount.solutions}
              />
            }
            key="solutions"
          >
            <Col span={24} md={24} style={{ paddingTop: "20px" }}>
              <SolutionList
                emptyMessage="Nenhuma solução encontrada."
                hasFilter={false}
                listType="solution"
              />
            </Col>
          </Tabs.TabPane>
          {listCount.procedures > 0 && (
            <Tabs.TabPane
              tab={
                <TabTitle
                  title={t("screeningBody.tabProcedures")}
                  count={listCount.procedures}
                />
              }
              key="procedures"
            >
              <Col span={24} md={24} style={{ paddingTop: "20px" }}>
                <ProcedureList
                  emptyMessage="Nenhuma solução encontrada."
                  hasFilter={false}
                  listType="procedure"
                />
              </Col>
            </Tabs.TabPane>
          )}
          {listCount.diet > 0 && (
            <Tabs.TabPane
              tab={
                <TabTitle
                  title={t("screeningBody.tabDiet")}
                  count={listCount.diet}
                />
              }
              key="diet"
            >
              <Col span={24} md={24} style={{ paddingTop: "20px" }}>
                <DietList
                  emptyMessage="Nenhuma dieta encontrada."
                  hasFilter={false}
                  listType="diet"
                />
              </Col>
            </Tabs.TabPane>
          )}
          <Tabs.TabPane
            tab={
              <TabTitle
                title={t("screeningBody.tabInterventions")}
                count={listCount.interventions}
              />
            }
            key="intervention"
          >
            <div style={{ paddingTop: "20px" }}>
              <PreviousInterventionList />
            </div>
          </Tabs.TabPane>
        </ScreeningTabs>
      </Row>

      <PrescriptionDrugForm />
      <BackTop />
    </>
  );
}
