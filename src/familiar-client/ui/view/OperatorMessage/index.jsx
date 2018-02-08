import React             from "react"
import Message           from "familiar-client/ui/view/Message"
import SpeakerImage      from "familiar-client/ui/view/SpeakerImage"
import TransmissionTime  from "familiar-client/ui/view/TransmissionTime"

import classNames        from "familiar-client/ui/view/OperatorMessage/classNames";

export default ({
    operatorSrc,
    text,
    createdDate,
    balloonColor,
    messageColor,
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
      <SpeakerImage
          src={operatorSrc}
      />
      <Message
          arrowPosition="left"
          text={text}
          balloonColor={balloonColor}
          messageColor={messageColor}
      />
      <TransmissionTime
          createdDate={createdDate}
      />
    </div>