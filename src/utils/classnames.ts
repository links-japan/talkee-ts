import classNames from "classnames";

export const classnames =
  (prefix: string) => (suffix?: string, className?: string) =>
    classNames(
      {
        [`${prefix}`]: !!prefix && !suffix,
        [`${prefix}-${suffix}`]: !!prefix && !!suffix,
      },
      className
    );

export default classnames;
