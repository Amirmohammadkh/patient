import { memo, SVGAttributes } from 'react';

export const ReplyIcon = memo(({ ...rest }: SVGAttributes<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 17 17" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.48769 3.21137C7.78058 3.50426 7.78058 3.97914 7.48769 4.27203L5.43468 6.32503H9.62402C9.64547 6.32503 9.66664 6.32503 9.68751 6.32503C10.246 6.32497 10.6013 6.32494 10.9107 6.36567C13.0422 6.64629 14.7194 8.32355 15.0001 10.455C15.0408 10.7644 15.0407 11.1197 15.0407 11.6782L15.0407 11.7417H13.5407C13.5407 11.0986 13.5391 10.8497 13.5129 10.6508C13.3209 9.19244 12.1733 8.04484 10.7149 7.85284C10.516 7.82665 10.2671 7.82503 9.62402 7.82503H5.43468L7.48769 9.87804C7.78058 10.1709 7.78058 10.6458 7.48769 10.9387C7.19479 11.2316 6.71992 11.2316 6.42703 10.9387L3.09369 7.60536C2.8008 7.31247 2.8008 6.8376 3.09369 6.5447L6.42703 3.21137C6.71992 2.91848 7.19479 2.91848 7.48769 3.21137Z"
      fill="currentColor"
    ></path>
  </svg>
));

export default ReplyIcon;
