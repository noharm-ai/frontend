import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Button, Popover, Select } from "antd";
import { FilterOutlined } from "@ant-design/icons";

import {
  COLLECTION_DETAILS,
  CollectionDetail,
  countDetails,
  ICollectionDetails,
  IDetailOption,
  NO_DETAILS,
} from "../cultureCollections";
import { FILTER_TEAL } from "../filterTeal";
import { DetailsForm } from "./CollectionDetailsFilter.style";

interface CollectionDetailsFilterProps {
  options: Record<CollectionDetail, IDetailOption[]>;
  details: ICollectionDetails;
  onChange: (details: ICollectionDetails) => void;
}

/**
 * The secondary filters of the collections (exam, material, microorganism),
 * behind a button: it counts the ones in use, so a narrowed list is never
 * taken for the whole of it
 */
export function CollectionDetailsFilter({
  options,
  details,
  onChange,
}: CollectionDetailsFilterProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const active = countDetails(details);

  const form = (
    <DetailsForm data-testid="collection-details-form">
      {COLLECTION_DETAILS.map((detail) => (
        // not a <label>: the dropdown renders inside it, and a click there
        // would be forwarded to the search
        <div className="details-field" key={detail}>
          <span className="details-label" aria-hidden>
            {t(`infectionControl.cultures.collections.moreFilters.${detail}`)}
          </span>
          <Select
            aria-label={t(
              `infectionControl.cultures.collections.moreFilters.${detail}`,
            )}
            mode="multiple"
            allowClear
            showSearch={{ optionFilterProp: "label" }}
            maxTagCount="responsive"
            placeholder={t(
              "infectionControl.cultures.collections.moreFilters.any",
            )}
            options={options[detail]}
            value={details[detail]}
            onChange={(values: string[]) =>
              onChange({ ...details, [detail]: values })
            }
            notFoundContent={t(
              "infectionControl.cultures.collections.moreFilters.none",
            )}
            // the dropdown inside the popover, so picking an option is not
            // a click outside it
            getPopupContainer={(trigger) => trigger.parentElement!}
            data-testid={`collection-details-${detail}`}
          />
        </div>
      ))}
      <div className="details-actions">
        <Button
          size="small"
          type="link"
          disabled={!active}
          onClick={() => onChange(NO_DETAILS)}
          data-testid="collection-details-clear"
        >
          {t("infectionControl.cultures.collections.moreFilters.clear")}
        </Button>
      </div>
    </DetailsForm>
  );

  return (
    <Popover
      content={form}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
    >
      <Badge count={active} size="small" color={FILTER_TEAL}>
        <Button
          size="small"
          icon={<FilterOutlined />}
          className={active ? "details-active" : undefined}
          data-testid="collection-details"
          data-kb="infectionControl.cultures.moreFilters"
        >
          {t("infectionControl.cultures.collections.moreFilters.button")}
        </Button>
      </Badge>
    </Popover>
  );
}
