import React, { useEffect } from "react";
import { useTransition, animated } from "@react-spring/web";
import { Spin } from "antd";

import Heading from "components/Heading";

import PrioritizationCard from "./Card";
import { PrioritizationPage } from "./index.style";

export default function Prioritization({
  prescriptions,
  fetchPrescriptionsList,
}) {
  const { isFetching, list, error } = prescriptions;
  const patients = isFetching ? [] : list.slice(0, 10);
  const transitions = useTransition(patients, {
    from: {
      transform: "translate3d(0, 40px, 0)",
      opacity: 0,
    },
    enter: { transform: "translate3d(0,0px,0)", opacity: 1 },
    leave: { transform: "translate3d(0,40px,0)", opacity: 0 },
    trail: 100,
    keys: (item) => `${item.idPrescription}`,
  });

  useEffect(() => {
    fetchPrescriptionsList({
      idSegment: 1,
      agg: 1,
      startDate: "2020-07-10",
      endDate: "all",
    });
  }, [fetchPrescriptionsList]);

  const refresh = () => {
    fetchPrescriptionsList({
      idSegment: 1,
      agg: 1,
      startDate: "2020-07-12",
      endDate: "all",
    });
  };

  return (
    <>
      <Heading>Priorização</Heading>
      <button onClick={refresh}>refresh</button>
      <Spin spinning={isFetching}>
        <PrioritizationPage>
          <div className="grid">
            {list &&
              transitions((props, item) => (
                <animated.div style={props}>
                  <PrioritizationCard prescription={item} />
                </animated.div>
              ))}
          </div>
        </PrioritizationPage>
      </Spin>
    </>
  );
}
