import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import api from "services/api";
import Empty from "components/Empty";
import LoadBox, { LoadContainer } from "components/LoadBox";

interface SearchResult {
  type: string;
  idPrescription: string;
  admissionNumber: number | string;
  date: string | null;
  concilia: string | null;
}

/**
 * The most recent prescription of an admission, from the same search the
 * header uses (aggregated prescriptions up to today, newest first; the
 * conciliation it may also return is skipped).
 */
const findLatestPrescription = (
  results: SearchResult[],
  admissionNumber: string,
): SearchResult | undefined =>
  results
    .filter(
      (r) =>
        r.type === "prescription" &&
        !r.concilia &&
        `${r.admissionNumber}` === admissionNumber,
    )
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))[0];

/**
 * /prescricao/atendimento/:admissionNumber: opens the most recent
 * prescription of the admission (used by the `link_atendimento` column of
 * custom reports). The query string is kept.
 */
export const AdmissionPrescription: React.FC = () => {
  const { admissionNumber = "" } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [notFound, setNotFound] = useState(false);

  const isValid = /^\d+$/.test(admissionNumber);

  useEffect(() => {
    if (!isValid) return;

    let active = true;

    api
      .searchPrescriptions(null, admissionNumber)
      .then((response: { data: { data: SearchResult[] } }) => {
        if (!active) return;

        const latest = findLatestPrescription(
          response.data?.data ?? [],
          admissionNumber,
        );

        if (latest) {
          navigate(`/prescricao/${latest.idPrescription}${search}`, {
            replace: true,
          });
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        if (active) setNotFound(true);
      });

    return () => {
      active = false;
    };
  }, [admissionNumber, isValid, navigate, search]);

  if (!isValid || notFound) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={`Nenhuma prescrição encontrada para o atendimento ${admissionNumber}.`}
      />
    );
  }

  return (
    <LoadContainer>
      <LoadBox $absolute={true} />
    </LoadContainer>
  );
};
