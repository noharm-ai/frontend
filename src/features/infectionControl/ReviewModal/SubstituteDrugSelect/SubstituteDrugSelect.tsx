import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";

import { Select } from "components/Inputs";
import { useAppDispatch, useAppSelector } from "src/store";

import {
  ISubstituteDrug,
  searchSubstituteDrugs,
} from "../../InfectionControlSlice";

// letters typed before the drugs are searched
const MIN_SEARCH = 3;

interface SubstituteDrugSelectProps {
  id: string;
  value: ISubstituteDrug | null;
  onChange: (drug: ISubstituteDrug | null) => void;
}

/**
 * One antimicrobial recommended instead of the one evaluated, searched by
 * name. The chosen drug is kept whole, so its name stays while other
 * searches come and go.
 */
export function SubstituteDrugSelect({
  id,
  value,
  onChange,
}: SubstituteDrugSelectProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { status, list } = useAppSelector(
    (state) => state.infectionControl.substituteSearch,
  );

  const search = useMemo(
    () =>
      debounce((term: string) => {
        if (term.trim().length < MIN_SEARCH) return;
        dispatch(searchSubstituteDrugs({ term: term.trim() }));
      }, 600),
    [dispatch],
  );
  useEffect(() => () => search.cancel(), [search]);

  const drugs = value
    ? [value, ...list.filter((drug) => drug.id !== value.id)]
    : list;

  return (
    <Select
      id={id}
      allowClear
      style={{ width: "100%" }}
      placeholder={t("infectionControl.review.substitutePlaceholder")}
      loading={status === "loading"}
      notFoundContent={
        status === "succeeded"
          ? t("infectionControl.review.substituteEmpty")
          : undefined
      }
      value={value?.id}
      onChange={(idDrug: any) =>
        onChange(drugs.find((drug) => drug.id === idDrug) ?? null)
      }
      showSearch={{ filterOption: false, onSearch: search }}
      options={drugs.map((drug) => ({
        value: drug.id,
        label: drug.name ?? `${drug.id}`,
      }))}
      popupMatchSelectWidth={false}
    />
  );
}
