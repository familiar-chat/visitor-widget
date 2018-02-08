import React    from "react"

import classNames  from "familiar-client/ui/view/Image/classNames"

export default ({
    className,
    alt,
    crossOrigin,
    height,
    onLoad,
    sizes,
    src,
    srcSet,
    style,
    width,
    ...props
}) =>
    <a
        className={[className, classNames.Host].join(" ")}
        style={{
            backgroundImage: src && "url(" + src + ")",
            width          : width != undefined ? width + "px"
                           :                      undefined,
            height         : height != undefined ? height + "px"
                           :                       undefined,
            ...style
        }}
        href={src}
        target="_blank"
        {...props}
    >
        <img
            alt={alt}
            crossOrigin={crossOrigin}
            height={height}
            onLoad={onLoad}
            sizes={sizes}
            src={src}
            srcSet={srcSet}
            width={width}
        />
    </a>

