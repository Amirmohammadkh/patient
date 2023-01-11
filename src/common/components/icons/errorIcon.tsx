import { memo, SVGAttributes } from 'react';

export const ErrorIcon = memo(({ ...rest }: SVGAttributes<SVGSVGElement>) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14 2.5C7.64873 2.5 2.5 7.64873 2.5 14C2.5 20.3513 7.64873 25.5 14 25.5C20.3513 25.5 25.5 20.3513 25.5 14C25.5 7.64873 20.3513 2.5 14 2.5ZM0 14C0 6.26801 6.26801 0 14 0C21.732 0 28 6.26801 28 14C28 21.732 21.732 28 14 28C6.26801 28 0 21.732 0 14ZM14 7.08333C14.6904 7.08333 15.25 7.64298 15.25 8.33333V15.4167C15.25 16.107 14.6904 16.6667 14 16.6667C13.3096 16.6667 12.75 16.107 12.75 15.4167V8.33333C12.75 7.64298 13.3096 7.08333 14 7.08333ZM14 21.0833C14.7824 21.0833 15.4167 20.4491 15.4167 19.6667C15.4167 18.8843 14.7824 18.25 14 18.25C13.2176 18.25 12.5833 18.8843 12.5833 19.6667C12.5833 20.4491 13.2176 21.0833 14 21.0833Z"
      fill="#FF0000"
      data-v-6f651adc=""
    ></path>
  </svg>
));

export default ErrorIcon;
