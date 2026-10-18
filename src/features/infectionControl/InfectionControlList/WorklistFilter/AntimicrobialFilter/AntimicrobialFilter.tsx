import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";

import { Select } from "components/Inputs";
import { useAppDispatch } from "src/store";

import {
  IAntimicrobialOption,
  ILabeledValue,
  searchAntimicrobials,
} from "../../../InfectionControlListSlice";

// letters typed before the drugs are searched
const MIN_SEARCH = 3;

interface AntimicrobialFilterProps {
  id: string;
  value: ILabeledValue[];
  onChange: (drugs: ILabeledValue[]) => void;
}

/**
 * The antimicrobials the worklist is narrowed to, searched by name. The
 * chosen ones keep their names, so they stay while other searches come and go
 */
export function AntimicrobialFilter({
  id,
  value,
  onChange,
}: AntimicrobialFilterProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [found, setFound] = useState<IAntimicrobialOption[]>([]);

  const search = useMemo(
    () =>
      debounce((term: string) => {
        if (term.trim().length < MIN_SEARCH) return;

        setLoading(true);
        // the store's middlewares leave unwrap out of the dispatched thunk
        (
          dispatch(searchAntimicrobials({ term: term.trim() })) as Promise<any>
        ).then((response) => {
          setFound(
            response.error ? [] : (response.payload as IAntimicrobialOption[]),
          );
          setLoading(false);
          setSearched(true);
        });
      }, 600),
    [dispatch],
  );
  useEffect(() => () => search.cancel(), [search]);

  const chosen = new Set(value.map((drug) => drug.value));
  const options = [
    ...value,
    ...found
      .filter((drug) => !chosen.has(drug.id))
      .map((drug) => ({ value: drug.id, label: drug.name })),
  ];

  return (
    <Select
      id={id}
      style={{ width: "100%" }}
      mode="multiple"
      allowClear
      maxTagCount="responsive"
      labelInValue
      placeholder={t("infectionControl.worklist.filters.drugsPlaceholder")}
      loading={loading}
      notFoundContent={
        searched && !loading
          ? t("infectionControl.worklist.filters.drugsEmpty")
          : null
      }
      value={value}
      onChange={(drugs: any) =>
        onChange(
          (drugs as ILabeledValue[]).map(({ value: idDrug, label }) => ({
            value: idDrug,
            label,
          })),
        )
      }
      showSearch={{ filterOption: false, onSearch: search }}
      options={options}
      popupMatchSelectWidth={false}
    />
  );
}
