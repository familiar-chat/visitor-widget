import  React            from "react"
import  MaterialIcon     from "familiar-client/ui/view/MaterialIcon"
import classNames     from "familiar-client/ui/view/Waiting/classNames";

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
        {...props}
    >
        <MaterialIcon
            className={classNames.Icon}
        >
            {"forum"}
        </MaterialIcon>
        <p
            className={classNames.Message}
        >
            チャット受付中
        </p>
    </div>;
