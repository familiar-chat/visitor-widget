import  config  from "api-common/config"

export default ({
    ...props
}) => {

    // create Element
    let host       = document.createElement("div");
    host.scrolling = "on";

    let slider     = document.createElement("div");
    let sliderIcon = document.createElement("div");
    let iFrame     = document.createElement("iframe");

    Object.assign(iFrame.style, {
        width          : "100%",
        height         : "calc(100% - 12px)",
        border         : "none",
        backgroundColor: "transparent",
        flexGrow       : "1"
    });

    Object.assign(slider.style, {
        height        : "14px",
        background    : "rgba(0,0,0,0.9)",
        display       : "none",
        justifyContent: "center",
        alignItems    : "center",
        cursor        : "pointer"
    });

    Object.assign(sliderIcon.style, {
        height      : "3px",
        background  : "#fafbfd",
        width       : "18px",
        borderRadius: "12px"
    });

    slider.appendChild(sliderIcon);
    host.appendChild(slider);
    host.appendChild(iFrame);

    // Add Event Listener
    let mouseMove = (e) => {
        let y             = e.changedTouches[0].clientY / document.documentElement.clientHeight;
        let height        = parseInt((1 - y) * 100);
        host.style.height = (height < 40 ? 40 : height > 80 ? 100 : height) + "%";
    };

    let mouseUp   = (e) => {
        document.body.removeEventListener("touchmove", mouseMove, false)
        document.body.removeEventListener("mousemove", mouseMove, false)
    }
    let mouseDown = (e) => {
        e.preventDefault();
        document.body.addEventListener("mousemove", mouseMove, false);
        document.body.addEventListener("touchmove", mouseMove, false);
    };

    slider.addEventListener("mousedown", mouseDown, false);
    slider.addEventListener("touchstart", mouseDown, false);
    slider.addEventListener("touchend", mouseUp, false);
    slider.addEventListener("mouseup", mouseUp, false);

    // receive message
    let receiveMessage = event => {
        if (event.origin == config.familiar.visitor_server.url) {
            switch (event.data.type) {
                case "location_request":
                    let sendData = {
                        locationHost        : location.host,
                        locationHostname    : location.hostname,
                        locationPort        : location.port,
                        locationPathname    : location.pathname,
                        locationHref        : location.href,
                        navigatorAppCodeName: navigator.appCodeName,
                        navigatorAppName    : navigator.appName,
                        navigatorAppVersion : navigator.appVersion,
                        navigatorLanguage   : navigator.language,
                        navigatorPlatform   : navigator.platform,
                        navigatorUserAgent  : navigator.userAgent,
                        documentReferrer    : document.referrer,
                        documentDomain      : document.domain,
                        screenWidth         : screen.width,
                        screenHeight        : screen.height,
                        screenColorDepth    : screen.colorDepth
                    };
                    if (iFrame.contentWindow) {
                        iFrame.contentWindow.postMessage(sendData, config.familiar.visitor_server.url);
                    }
                    break;
                case "widget_waiting":
                    if (window.outerWidth > 767) {
                        Object.assign(host.style, {
                            position       : "fixed",
                            right          : "0",
                            left           : "initial",
                            bottom         : "120px",
                            width          : "160px",
                            height         : "110px",
                            border         : "none",
                            backgroundColor: "transparent",
                            borderRadius   : "4px 0 0 4px",
                            boxShadow      : "rgba(0, 0, 0, 0.0980392) 0px 0px 10px 4px",
                            zIndex         : "818181",
                            display        : "flex",
                            flexDirection  : "column",
                            transition     : "all 0.3s ease"
                        })
                    } else {
                        Object.assign(host.style, {
                            position     : "fixed",
                            bottom       : "2%",
                            right        : "2%",
                            left         : "initial",
                            width        : "50%",
                            background   : "transparent",
                            height       : "36px",
                            border       : "none",
                            boxShadow    : "rgba(0, 0, 0, 0.37) 0px -2px 14px 0px",
                            zIndex       : "818181",
                            display      : "flex",
                            flexDirection: "column",
                            transition   : "all 0.8s ease"
                        })
                    }
                    slider.style.display = "none";
                    break;
                case "widget_active":
                    if (window.outerWidth > 767) {
                        Object.assign(host.style, {
                            position       : "fixed",
                            right          : "3px",
                            left           : "initial",
                            bottom         : "0",
                            width          : "280px",
                            height         : "390px",
                            border         : "none",
                            backgroundColor: "transparent",
                            borderRadius   : "4px 4px 0 0",
                            boxShadow      : "rgba(0, 0, 0, 0.0980392) 0px 0px 10px 4px",
                            zIndex         : "818181",
                            left           : "none",
                            display        : "flex",
                            flexDirection  : "column",
                            transition     : "all 0.3s ease"
                        })
                    } else {
                        Object.assign(host.style, {
                                position       : "fixed",
                                right          : "0",
                                bottom         : "0",
                                width          : "100%",
                                height         : "50%",
                                border         : "none",
                                backgroundColor: "transparent",
                                boxShadow      : "rgba(0, 0, 0, 0.37) 0px -2px 14px 0px",
                                zIndex         : "818181",
                                left           : "initial",
                                display        : "flex",
                                flexDirection  : "column",
                                transition     : "all 0.8s ease"
                            }
                        );
                        slider.style.display = "flex";
                    }
                    break;
            }
        }
    };

    window.addEventListener('message', receiveMessage, false);

    for (let x in props)
        iFrame.setAttribute(x, props[x])

    return host
};
