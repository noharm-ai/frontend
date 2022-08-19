import React, { useEffect } from "react";
import { Spin } from "antd";

import Heading from "components/Heading";

import PrioritizationCard from "./Card";
import { PrioritizationPage } from "./index.style";

export default function Prioritization({
  prescriptions,
  fetchPrescriptionsList,
}) {
  const { isFetching, list, error } = prescriptions;

  useEffect(() => {
    fetchPrescriptionsList({
      idSegment: 1,
      agg: 1,
      startDate: "2020-07-10",
      endDate: "all",
    });
  }, [fetchPrescriptionsList]);

  return (
    <>
      <Heading>Priorização</Heading>
      <Spin spinning={isFetching}>
        <PrioritizationPage>
          <div className="grid">
            {list &&
              list.map((item) => (
                <PrioritizationCard
                  prescription={item}
                  key={item.idPrescription}
                />
              ))}
          </div>
        </PrioritizationPage>
      </Spin>
    </>
  );
}
