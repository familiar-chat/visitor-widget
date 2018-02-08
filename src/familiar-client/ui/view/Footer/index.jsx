import  React from "react"

import classNames  from "familiar-client/ui/view/Footer/classNames";

export default ({
    className,
    ...props
}) =>
    <div
      className={
        [
          className,
          classNames.Host
        ].join(" ")
      }
    >
        All of the Business from&nbsp;
        <a
            href=""
            className={classNames.FooterLink}
            target="_blank"
        >
          FamiliarChat
        </a>
    </div>;
