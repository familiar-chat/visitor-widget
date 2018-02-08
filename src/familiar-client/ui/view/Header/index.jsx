import  React         from "react"
import  MaterialIcon  from "familiar-client/ui/view/MaterialIcon"

import classNames    from "familiar-client/ui/view/Header/classNames";

let onClick = e =>{
    document.body.addEventListener("mousemove",(e)=>{
    })
}

export default ({
    widget,
    toWaitingWidget = _ => undefined,
    className,
    ...props
}) =>
    <div
        className={[
            className,
            classNames.Host
        ].join(" ")
        }
    >
        <div
            className={classNames.TitleBar}
            style={widget && {
                backgroundColor: widget.colors.main
            }}
        >
            <p
                className={classNames.WidgetTitle}
                style={widget && {
                    color: widget.colors.title
                }}
            >
                {widget && widget.title}
            </p>
            <MaterialIcon
                className={classNames.MinimizeButton}
                onMouseDown={toWaitingWidget}
            >
                {"expand_more"}
            </MaterialIcon>
        </div>
        <div
            className={classNames.Information}
        >
            <span
                className={classNames.Subtitle}
            >
                {widget && widget.subtitle}
            </span>
            <p
                className={classNames.Description}
                style={widget && {
                    color: widget.colors.description
                }}
            >
                {widget && widget.description}
            </p>
        </div>
        <img
            className={classNames.AccountImage}
            src={widget && widget.image}
        >
        </img>
    </div>;
