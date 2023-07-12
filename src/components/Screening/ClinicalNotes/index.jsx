import React, { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { SearchOutlined, CloudDownloadOutlined } from "@ant-design/icons";

import { Row, Col } from "components/Grid";
import LoadBox, { LoadContainer } from "components/LoadBox";
import Empty from "components/Empty";
import { Select } from "components/Inputs";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import Tag from "components/Tag";
import { getFirstAndLastName } from "utils";

import View from "./View";
import ClinicalNotesIndicator from "./ClinicalNotesIndicator";
import { Container, List, FilterContainer } from "./index.style";

export default function ClinicalNotes({
  isFetching,
  isFetchingExtra,
  list,
  selected,
  select,
  update,
  positionList,
  security,
  saveStatus,
  access_token,
  userId,
  featureService,
  fetchByDate,
  admissionNumber,
  admissionNumberPopup,
  dates,
  popup,
}) {
  const [positions, setPositions] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [selectedPositions, selectPositions] = useState([]);
  const [selectedIndicators, selectIndicators] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const { t } = useTranslation();
  const filterList = useCallback(
    (stateList, selectFirst, positionsArray, indicatorsArray) => {
      const filteredGroup = [];
      Object.keys(stateList).forEach((g) => {
        const clinicalNotes = stateList[g];

        if (positionsArray.length === 0 && indicatorsArray.length === 0) {
          filteredGroup.push({
            label: g,
            value: clinicalNotes,
          });
        } else {
          const filteredNotes = clinicalNotes.filter((item) => {
            const hasPosition =
              positionsArray.length === 0
                ? true
                : positionsArray.indexOf(item.position) !== -1;

            let hasIndicator = false;
            if (indicatorsArray.length > 0) {
              indicatorsArray.forEach((indicator) => {
                hasIndicator = hasIndicator || item[indicator] > 0;
              });
            } else {
              hasIndicator = true;
            }

            return hasPosition && hasIndicator;
          });

          if (filteredNotes.length) {
            filteredGroup.push({
              label: g,
              value: filteredNotes,
            });
          }
        }
      });

      if (selectFirst) {
        if (filteredGroup.length) {
          select(filteredGroup[0].value[0]);
        } else {
          select({});
        }
      }

      return filteredGroup;
    },
    [select]
  );
  const localAdmissionNumber = admissionNumber || admissionNumberPopup;

  useEffect(() => {
    setFilteredList(
      filterList(list, false, selectedPositions, selectedIndicators)
    );
  }, [list]); //eslint-disable-line

  const handlePositionChange = (p) => {
    setPositions(p);
  };

  const handleIndicatorsChange = (i) => {
    setIndicators(i);
  };

  const search = () => {
    selectPositions(positions);
    selectIndicators(indicators);

    setFilteredList(filterList(list, true, positions, indicators));
  };

  const fetchExtra = (date) => {
    fetchByDate(localAdmissionNumber, date);
  };

  if (isFetching) {
    return (
      <LoadContainer>
        <LoadBox absolute={true} />
      </LoadContainer>
    );
  }

  return (
    <Container>
      <Row type="flex" gutter={0}>
        <Col md={14} xl={16} className="paper-panel">
          <View
            selected={selected}
            update={update}
            security={security}
            access_token={access_token}
            userId={userId}
            featureService={featureService}
            saveStatus={saveStatus}
            popup={popup}
            admissionNumber={localAdmissionNumber}
          />
        </Col>
        <Col md={10} xl={8} className="list-panel">
          {positionList.length > 0 && (
            <FilterContainer>
              <div>
                <label>
                  {t(
                    `labels.${
                      featureService.hasPrimaryCare() ? "type" : "role"
                    }`
                  )}
                </label>
                <Select
                  placeholder={t(
                    `labels.${
                      featureService.hasPrimaryCare() ? "type" : "role"
                    }PlaceholderFilter`
                  )}
                  onChange={handlePositionChange}
                  allowClear
                  style={{ width: "90%" }}
                  mode="multiple"
                  optionFilterProp="children"
                  dropdownMatchSelectWidth={false}
                >
                  {positionList.map((p, i) => (
                    <Select.Option value={p} key={i}>
                      {p}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              {featureService.hasNoHarmCare() &&
                !featureService.hasPrimaryCare() && (
                  <div>
                    <label>{t("labels.indicator")}</label>
                    <Select
                      placeholder={t("labels.indicatorPlaceholderFilter")}
                      onChange={handleIndicatorsChange}
                      allowClear
                      style={{ width: "100%" }}
                      mode="multiple"
                      optionFilterProp="children"
                      dropdownMatchSelectWidth={false}
                    >
                      {ClinicalNotesIndicator.list(t).map((indicator, i) => (
                        <Select.Option
                          value={indicator.key}
                          key={indicator.key}
                        >
                          <span
                            style={{
                              backgroundColor: indicator.backgroundColor,
                              borderColor: indicator.color,
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderRadius: "5px",
                              padding: "0 2px",
                              display: "inline-block",
                              fontWeight: 500,
                              lineHeight: 1.3,
                            }}
                          >
                            {indicator.label}
                          </span>
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                )}

              <div className="btn-search">
                <Tooltip title={t("buttons.search")}>
                  <Button
                    type="secondary gtm-cn-btn-search"
                    shape="circle"
                    icon={<SearchOutlined />}
                    size="large"
                    onClick={search}
                  />
                </Tooltip>
              </div>
            </FilterContainer>
          )}
          <List t={t}>
            {filteredList.length === 0 && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nenhuma evolução encontrada"
              />
            )}
            {filteredList.length > 0 && (
              <>
                {filteredList.map((group) => (
                  <React.Fragment key={group.label}>
                    <h2>{format(parseISO(group.label), "dd/MM/yyyy")}</h2>
                    <div className="line-group">
                      {group.value.length ? (
                        group.value.map((c, i) => (
                          <div
                            className={`line ${
                              selected && c.id === selected.id ? "active" : ""
                            }`}
                            key={i}
                            onClick={() => select(c)}
                            aria-hidden="true"
                          >
                            <div className="time">
                              {c.date.substr(11, 5)}
                              <div>&nbsp;</div>
                            </div>
                            <div className="name">
                              {getFirstAndLastName(c.prescriber)}
                              <span>{c.position || "-"}</span>
                            </div>
                            <div className="indicators">
                              {ClinicalNotesIndicator.listByCategory(
                                "priority",
                                t
                              ).map((indicator) => (
                                <React.Fragment key={indicator.key}>
                                  {c[indicator.key] > 0 && (
                                    <Tooltip title={indicator.label}>
                                      <Tag className={indicator.key}>
                                        {c[indicator.key]}
                                      </Tag>
                                    </Tooltip>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="day-info ">
                          <div>
                            <Button
                              onClick={() => fetchExtra(group.label)}
                              icon={
                                <CloudDownloadOutlined
                                  style={{ fontSize: "18px" }}
                                />
                              }
                              loading={isFetchingExtra === group.label}
                            >
                              Abrir evoluções ({dates[group.label].count})
                            </Button>
                          </div>
                          <div className="indicators">
                            {ClinicalNotesIndicator.listByCategory(
                              "priority",
                              t
                            ).map((indicator) => (
                              <React.Fragment key={indicator.key}>
                                {dates[group.label] &&
                                  dates[group.label][indicator.key] > 0 && (
                                    <Tooltip title={indicator.label}>
                                      <Tag className={indicator.key}>
                                        {dates[group.label][indicator.key]}
                                      </Tag>
                                    </Tooltip>
                                  )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </>
            )}
          </List>
        </Col>
      </Row>
    </Container>
  );
}
