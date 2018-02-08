import  RootFrame    from "familiar-widget-assign/view/RootFrame"
import  config       from "api-common/config"

(async _ => {
    await new Promise(resolve => window.addEventListener("load", resolve, false));

    let regexp = new RegExp("^" + config.familiar.visitor_server.url + "/visitor/widget");

    let script = (
        Array.from(document.scripts).find(x => regexp.test(x.src))
    );

    document.body.appendChild(
        RootFrame({
            src: config.familiar.visitor_server.url + "/visitor/index.html?account_id=" + script.src.replace(/^.*\?.*=(.*)$/, "$1") + "&origin=" + location.origin + "&pathname=" + location.pathname
        })
    );

})();
