import React from "react";
import { ExportOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";

import type { ColumnLinkMeta } from "../types";

export interface LinkCellProps {
  href: string;
  id: string;
  link: ColumnLinkMeta;
}

/**
 * A button that opens the link in a new tab. Rendered by antd as an anchor
 * (href), so middle-click and "copy link" keep working.
 */
export const LinkCell: React.FC<LinkCellProps> = ({ href, id, link }) => {
  const description = `${link.title} ${id}`;

  return (
    <Tooltip title={description}>
      <Button
        size="small"
        href={href}
        target="_blank"
        rel="noreferrer"
        icon={<ExportOutlined />}
        iconPlacement="end"
        aria-label={description}
        // the row click opens the record drawer; following the link must not
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {link.label}
      </Button>
    </Tooltip>
  );
};
