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
        created By Nozomi Sugiyama
        <a
            href="https://github.com/familiar-chat/"
            className={classNames.FooterLink}
            target="_blank"
        >
          FamiliarChat
        </a>
    </div>;
