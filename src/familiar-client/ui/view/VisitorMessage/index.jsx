import  React             from "react"
import  Message           from "familiar-client/ui/view/Message"
import  TransmissionTime  from "familiar-client/ui/view/TransmissionTime"

import classNames        from "familiar-client/ui/view/VisitorMessage/classNames";

export default ({
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
        <TransmissionTime
            createdDate={createdDate}
        />
        <Message
            arrowPosition="right"
            text={text}
            balloonColor={balloonColor}
            messageColor={messageColor}
        />
    </div>
