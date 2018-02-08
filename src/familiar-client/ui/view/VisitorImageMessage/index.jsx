import React             from "react"
import Image             from "familiar-client/ui/view/Image"
import Message           from "familiar-client/ui/view/Message"
import TransmissionTime  from "familiar-client/ui/view/TransmissionTime"

import classNames from "familiar-client/ui/view/VisitorImageMessage/classNames";

export default ({
    src,
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
        <Image
            className={classNames.Image}
            src={src}
            width={200}
            height={200}
        />
    </div>
