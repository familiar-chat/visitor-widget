import  React       from "react"

import classNames  from "familiar-client/ui/view/Message/classNames";

export default ({
  arrowPosition = "left",
  text,
  balloonColor = "#f6f6f6",
  messageColor = "white",
  className,
  ...props
}) =>
    <div
        className={
            [
                className,
                classNames.Host,
                arrowPosition == "left" ? classNames.Left
                  : classNames.Right
            ].join(" ")
        }
        style={{
            backgroundColor: balloonColor
        }}
    >
        <pre
            className={classNames.Message}
            style={{
              color: messageColor,
            }}
            {...props}
        >
            {text}
        </pre>
    </div>