import  React               from "react"
import OperatorMessage      from "familiar-client/ui/view/OperatorMessage"
import OperatorImageMessage from "familiar-client/ui/view/OperatorImageMessage"
import VisitorMessage       from "familiar-client/ui/view/VisitorMessage"
import VisitorImageMessage  from "familiar-client/ui/view/VisitorImageMessage"

import classNames  from "familiar-client/ui/view/Log/classNames"

export default ({
    className,
    messages = [],
    receivedMessages= [],
    triggerMessages = [],
    widget,
    ...props
}) => {
    let allMessage = (
        messages.map(x => {
            x._name = "visitor"
            return x
        })
        .concat(
            receivedMessages.map(x => {
                x._name = "operator"
                return x
            }),
            triggerMessages.map(x => {
                x._name = "trigger"
                return x
            })
        )
    ).sort((a, b) => 
        a.id < b.id ? -1 
      : a.id > b.id ? 1 
      : 0
    )
        
    return (
        <div
            className={
                [
                    className,
                    classNames.Host
                ].join(" ")
            }
            {...props}
        >
            {allMessage.map(x => 
                x._name == "visitor" ?
                    x.type == "image" ? 
                        <VisitorImageMessage
                            key={x.id}
                            src={x.url}
                            createdDate={x.created_date}
                            balloonColor={widget && widget.colors.visitor_message.background}
                        />
                  :     <VisitorMessage
                            key={x.id}
                            text={x.text}
                            createdDate={x.created_date}
                            balloonColor={widget && widget.colors.visitor_message.background}
                            messageColor={widget && widget.colors.visitor_message.text}
                        />
              : x._name == "operator" ?
                    x.type == "image" ?
                        <OperatorImageMessage
                            key={x.id}
                            src={x.url}
                            createdDate={x.created_date}
                            balloonColor={widget && widget.colors.user_message.background}
                            operatorSrc={widget && widget.image}
                        />
                  :     <OperatorMessage
                            key={x.id}
                            text={x.text}
                            createdDate={x.created_date}
                            balloonColor={widget && widget.colors.user_message.background}
                            messageColor={widget && widget.colors.user_message.text}
                            operatorSrc={widget && widget.image}
                        />
              : x._name == "trigger" ?
                    x.type == "image" ? 
                        <OperatorImageMessage
                            key={x.id}
                            src={x.url}
                            createdDate={x.created_date}
                            balloonColor={widget && widget.colors.user_message.background}
                            operatorSrc={widget && widget.image}
                        />
                  :     <OperatorMessage
                            key={x.id}
                            text={x.text}
                            createdDate={x.created_date}
                            balloonColor={widget && widget.colors.user_message.background}
                            messageColor={widget && widget.colors.user_message.text}
                        />
              : null
            )}
        </div>
    )
}