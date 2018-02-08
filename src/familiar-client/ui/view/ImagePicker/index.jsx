import  React        from "react"
import  MaterialIcon from "familiar-client/ui/view/MaterialIcon"

import classNames  from "familiar-client/ui/view/ImagePicker/classNames";

export default ({
    id,
    name = id,
    className,
    onSelectImage = image => undefined,
    ...props
}) =>
    <li
        className={
          [
            className,
            classNames.Host
          ].join(" ")
        }
    >
        <label
            className={classNames.Label}
            htmlFor={id}
        >
            <MaterialIcon>
                photo
            </MaterialIcon>
        </label>
        <input
            accept="image/*"
            id={id}
            name={name}
            onChange={e => onSelectImage(e.target.files[0])}
            type="file"
            style={{display: "none"}}
        />
    </li>