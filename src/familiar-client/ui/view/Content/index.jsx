import React               from "react"
import ReactDOM            from "react-dom"
import ActionPickerList    from "familiar-client/ui/view/ActionPickerList"
import ChatPanel           from "familiar-client/ui/view/ChatPanel"
import ImagePicker         from "familiar-client/ui/view/ImagePicker"
import Log                 from "familiar-client/ui/view/Log"

import classNames  from "familiar-client/ui/view/Content/classNames"

export default class extends React.Component {

    componentDidMount() {
        let logElement       = ReactDOM.findDOMNode(this).children[0];
        logElement.scrollTop = logElement.scrollHeight;
    }

    componentDidUpdate() {
        let logElement       = ReactDOM.findDOMNode(this).children[0];
        logElement.scrollTop = logElement.scrollHeight;
    }

    render() {
        let {
            visitorGeneral: {
                messages = [],
                received_messages = [],
                trigger_messages = []
            },
            widget,
            className,
            sendMessageImage = image => undefined,
            sendMessage = message => undefined,
            ...props
        } = this.props;

        let allMessage = messages.concat(received_messages, trigger_messages)
            .sort((a, b) => 
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
            >
                <Log
                    messages={messages}
                    receivedMessages={received_messages}
                    triggerMessages={trigger_messages}
                    widget={widget}
                />
                <ChatPanel
                    sendMessage={(message) => {
                        let logElement       = ReactDOM.findDOMNode(this).children[0];
                        logElement.scrollTop = logElement.scrollHeight;
                        sendMessage(message)
                    }}
                >
                    <ActionPickerList
                        className={classNames.ActionPickerList}
                    >
                        <ImagePicker
                            id={'image'}
                            onSelectImage={image => {
                                let logElement       = ReactDOM.findDOMNode(this).children[0];
                                logElement.scrollTop = logElement.scrollHeight;
                                
                                sendMessageImage(image)
                            }}
                        />
                    </ActionPickerList>
                </ChatPanel>
            </div>
        )
    }
}