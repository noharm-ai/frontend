import React from "react";

import withLayout from "lib/withLayout";
import PatientList from "containers/PatientList";
import Filter from "containers/PatientList/Filter";

const layoutProps = {
  theme: "boxed",
  pageTitle: "menu.patients",
};

export default withLayout(
  () => (
    <>
      <Filter />
      <PatientList />
    </>
  ),
  layoutProps
);
