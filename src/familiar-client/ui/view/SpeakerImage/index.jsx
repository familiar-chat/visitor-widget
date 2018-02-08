import  React   from "react"

import classNames  from "familiar-client/ui/view/SpeakerImage/classNames";

export default (
  {
    src,
    className,
    ...props
  }
) => <div
  className={
    [
      className,
      classNames.Host
    ].join(" ")
  }
>
  <span/>
  <img
    src={src ? src : "/visitor/img/speaker_image.png"}
  />
</div>;