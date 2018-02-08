import  React             from "react"
import  MaterialIcon      from "familiar-client/ui/view/MaterialIcon"

import classNames  from "familiar-client/ui/view/ChatPanel/classNames";

export default ({
    children,
    className,
    sendMessage = message => undefined,    
    ...props
}) => 
    <form
        className={
            [
                className,
                classNames.Host
            ].join(" ")
        }
        onSubmit={e => {
            e.preventDefault();
            let form = e.target;

            let textarea = form.querySelector("*[name='message']");
            if (textarea.value != "" && textarea.value.match(/\S/g)) {
                sendMessage({
                    text        : textarea.value,
                    type        : "visitor",
                    created_date: new Date().getTime()
                })
                textarea.value = "";
            }
        }}
    >
        <textarea
            onKeyDown={e => {
                if (e.shiftKey && e.keyCode == 13) {

                } else if (window.innerWidth < 300 && e.keyCode == 13 && e.target.value != "") {
                    e.preventDefault();
                    if(e.target.value.match(/\S/g))
                        sendMessage({
                            text        : e.target.value,
                            type        : "visitor",
                            created_date: new Date().getTime()
                        })
                    e.target.value = "";
                }
            }}
            name="message"
            required
            placeholder={window.innerWidth > 300 ? "メッセージを入力" : "メッセージを入力\nShift + Enterで改行" }
        />
        {children}
        <button
            className={classNames.Submit}
        >
            <MaterialIcon
                className={classNames.SubmitIcon}
            >
                send
            </MaterialIcon>
        </button>
    </form>;
