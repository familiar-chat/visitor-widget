import  React    from "react"
import  Content  from "familiar-client/ui/view/Content"
import  Footer   from "familiar-client/ui/view/Footer"
import  Header   from "familiar-client/ui/view/Header"

import classNames  from "familiar-client/ui/view/Widget/classNames";

export default ({
    className,
    sendMessage = message => undefined,
    sendMessageImage = image => undefined,
    toWaitingWidget,
    visitorGeneral,
    widget,
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
        <Header
            widget={widget}
            toWaitingWidget={toWaitingWidget}
        />
        <Content
            visitorGeneral={visitorGeneral}
            widget={widget}
            sendMessage={sendMessage}
            sendMessageImage={sendMessageImage}
        />
        <Footer
            className={classNames.Footer}
        />
    </div>