import * as React from 'react';

/**
 * Table/list pager — range summary + numbered controls; active page gradient.
 * @startingPoint section="Data" subtitle="Table footer pager" viewport="700x90"
 */
export interface PaginationProps {
  page: number;
  total: number;
  perPage?: number;
  onChange?: (page: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function Pagination(props: PaginationProps): JSX.Element;
