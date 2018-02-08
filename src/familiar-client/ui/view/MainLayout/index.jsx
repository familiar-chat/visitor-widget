import  React         from "react"
import  config        from "api-common/config"
import  Content       from "familiar-client/ui/view/Content"
import  Footer        from "familiar-client/ui/view/Footer"
import  Header        from "familiar-client/ui/view/Header"
import  Widget        from "familiar-client/ui/view/Widget"
import  Waiting       from "familiar-client/ui/view/Waiting"
import  OutsideHours  from "familiar-client/ui/view/OutsideHours"

import classNames  from "familiar-client/ui/view/MainLayout/classNames"

let checkConditions = ({
    conditions,
    visitCount,
    urlPath,
    operate,
    message
}) => {
    let decision = conditions.map(c => {
        let d = (
            c.type == "url" && urlPath ?
                c.values.map(v => 
                    v.match_condition == "perfect"  ? urlPath == v.value
                  : v.match_condition == "forward"  ? !urlPath.indexOf(v.value)
                  : v.match_condition == "backward" ? urlPath.endsWith(v.value)
                  : false
                )
          : c.type == "visit_count" && visitCount ?
                c.values.map(v => 
                    v.match_condition == "equal"       ? visitCount == v.value
                  : v.match_condition == "not_less"    ? visitCount >= v.value
                  : v.match_condition == "not_greater" ? visitCount <= v.value
                  : false
                )
          : c.type == "message" && message ?
                c.values.map(v => 
                    v.match_condition == "perfect" ? message == v.value
                  : v.match_condition == "partial" ? message.indexOf(v.value) != -1
                  : false
                )
          : [false]
        )

        switch(c.operate) {
            case "or":
                return d.some(x => x)
            case "and":
                return d.every(x => x)
            default:
                return false
        }
    })

    switch(operate) {
        case "or":
            return decision.some(x => x)
        case "and":
            return decision.every(x => x)
        default:
            return false
    }
}

export default class extends React.Component {
    componentWillMount() {
        this.setState({
            visitorGeneral          : undefined,
            widget                  : undefined,
            // viewState == widget       => widget_active
            // viewState == outsideHours => widget_waiting
            // viewState == waiting      => widget_waiting
            viewState               : "waiting",
            sendMessage             : undefined,
            subscribeVisitorGeneral : undefined,
        })
    }

    componentDidMount() {
        (async _ => {
            let userId = await new Promise((resolve, reject) => {
                let loop = _ => {
                    let u = this.props.getCurrentUserId()
                    u && resolve(u)

                    setTimeout(loop, 100)
                }
                loop()
            })

            let {
                organizationVisitorGeneralApi: {
                    read     : readVisitorGeneral,
                    subscribe: subscribeVisitorGeneral,
                    update   : updateVisitorGeneral,
                },
                organizationCalendarApi: {
                    read     : readCalendar
                },
                organizationSiteApi: {
                    read     : readSite
                },
                organizationTriggerApi: {
                    read     : readTrigger,
                },
                visitorMessageApi: {
                    create   : createMessage,
                    read     : readMessage,
                    subscribe: subscribeMessage
                },
                visitorReceivedMessageApi: {
                    create   : createReceivedMessage,
                    read     : readReceivedMessage,
                    subscribe: subscribeReceivedMessage
                },
                visitorTriggerMessageApi: {
                    create   : createTriggerMessage,
                    read     : readTriggerMessage,
                    subscribe: subscribeTriggerMessage
                },
                getTriggerInfo,
                getCurrentUserId,
                origin,
                pathname,
                parent,
                ...props
            } = this.props
            
            let onVisitorGeneralChanged = async visitorGeneral => {
                let messageCount = this.state.visitorGeneral && this.state.visitorGeneral.messages.length 
                                                              + this.state.visitorGeneral.received_messages.length 
                                                              + this.state.visitorGeneral.trigger_messages.length
                
                let newMessageCount = visitorGeneral.messages.length 
                                    + visitorGeneral.received_messages.length
                                    + visitorGeneral.trigger_messages.length

                if (messageCount < newMessageCount) {

                    if(this.state.viewState != "widget" && parent)
                        parent.postMessage({type: "widget_active"}, origin),
                        this.setState({viewState: "widget"})

                    if(!document.hidden)
                        await updateVisitorGeneral({
                            visitor: {
                                id: getCurrentUserId()
                            },
                            general: {
                                visitor_read_time: new Date().getTime()
                            }
                        })
                    else {
                        let fun = async() => {
                            if(!document.hidden) {
                                await updateVisitorGeneral({
                                    visitor: {
                                        id: getCurrentUserId()
                                    },
                                    general: {
                                        visitor_read_time: new Date().getTime()
                                    }
                                })
                                document.removeEventListener("visibilitychange", fun, false)
                            }
                        }
                        document.addEventListener(
                            "visibilitychange",
                            fun,
                            false
                        )
                    }

                }
            

                this.setState({visitorGeneral})
            }

            onVisitorGeneralChanged(await readVisitorGeneral())
            
            this.setState({
                subscribeVisitorGeneral : await subscribeVisitorGeneral({subscriber: onVisitorGeneralChanged})
            })

            let today = new Date();
            let s     = today.getHours() * 3600
                      + today.getMinutes() * 60
                      + today.getSeconds();

            let sites = await readSite()
            let site  = sites.find(s => pathname == s.hostname && s.enabled && s.id)

            this.setState({
                widget: site ? site.widget
                             : sites[0].widget
            })

            let calendar = await readCalendar()

            if (
                calendar.some(c =>
                    (c.day_of_the_week == today.getDay() || (c.day_of_the_week == 0 && c.day_of_the_week == 7))
                 && (s < c.start_time || s > c.end_time)
                )
            ) {
                this.setState({viewState: "outsideHours"})
                parent.postMessage({type: "widget_waiting"}, origin)
            } else {
                this.setState({viewState: "waiting"})
                parent.postMessage({type: "widget_waiting"}, origin)
            }
            
            let triggerInfo = await new Promise((resolve, reject) => {
                let loop = _ => {
                    let i = getTriggerInfo()
                    i && resolve(i)

                    setTimeout(loop, 100)
                }
                loop()
            })

            let triggers = await readTrigger()

            triggers.forEach(t => {
                t.enabled 
             && checkConditions({
                    conditions : t.conditions,
                    urlPath    : triggerInfo.visitor.location.pathname,
                    operate    : t.operate,
                    visitCount : triggerInfo.visitCount
                }) 
             && t.actions.map(a => {
                    switch(a.type) {
                        case "send_message":
                            setTimeout(
                                async _ => 
                                    await createTriggerMessage({
                                        message: {
                                            text        : a.value,
                                            type        : "trigger",
                                            created_date: new Date().getTime()
                                        }
                                    }),
                                a.secound * 1000
                            )
                            break;
                        case "send_image_message":
                            setTimeout(
                                async _ => 
                                    await createTriggerMessage({
                                        message: {
                                            url         : a.value,
                                            type        : "image",
                                            created_date: new Date().getTime()
                                        }
                                    }),
                                a.secound * 1000
                            )
                            break;
                    }
                })
            })

            this.setState({
                sendMessage: (message => {
                    ;(async _ => {
                        await createMessage({
                            message
                        })

                        triggers.filter(t => 
                            t.conditions.some(c => 
                                c.type == "message"
                            )
                        )
                            .forEach(t => {
                                t.enabled
                            &&  checkConditions({
                                    conditions : t.conditions,
                                    urlPath    : triggerInfo.visitor.location.pathname,
                                    operate    : t.operate,
                                    visitCount : triggerInfo.visitCount,
                                    message    : message.text
                                })
                            &&  t.actions.map(a => {
                                    switch(a.type) {
                                        case "send_message":
                                            setTimeout(
                                                async _ =>
                                                    await createTriggerMessage({
                                                        message: {
                                                            text        : a.value,
                                                            type        : "trigger",
                                                            created_date: new Date().getTime()
                                                        }
                                                    })
                                                ,
                                                a.secound * 1000
                                            )
                                            break;
                                        case "send_image_message":
                                            setTimeout(
                                                async _ => 
                                                    await createTriggerMessage({
                                                        message: {
                                                            url         : a.value,
                                                            type        : "image",
                                                            created_date: new Date().getTime()
                                                        }
                                                    })
                                                ,
                                                a.secound * 1000
                                            )
                                            break;
                                    }
                                })
                        })
                    })()
                })
            })
        })()
    }

    componentWillUnmount() {
        let {
            organizationVisitorGeneralApi: {
                unsubscribe: unsubscribeVisitorGeneral
            }
        } = this.props

        if (this.state.subscribeVisitor)
            unsubscribeVisitorGeneral(this.state.subscribeVisitorGeneral)
    }

    render() {

        let {
            organizationVisitorGeneralApi,
            organizationSiteApi,
            organizationWidgetApi,
            visitorMessageApi,
            visitorMessageImageApi,
            visitorTriggerMessageApi,
            getCurrentOrganizationId,
            getCurrentUserId,
            location,
            tokneApi,
            origin,
            parent,
            ...props
        } = this.props;

        if (getCurrentUserId() == undefined || getCurrentOrganizationId() == undefined)
            return null
        
        if (this.state.viewState == "widget")
            return(
                <Widget
                    visitorGeneral={this.state.visitorGeneral}
                    widget={this.state.widget}
                    className={classNames.Widget}
                    toWaitingWidget={_ => 
                        parent
                     && (
                            parent.postMessage({type: "widget_waiting"}, origin),
                            this.setState({viewState: "waiting"})
                        )
                    }
                    sendMessage={this.state.sendMessage}
                    sendMessageImage={image => visitorMessageImageApi.create({image})}
                />
            )
        
        if (this.state.viewState == "waiting")
            return(
                <Waiting
                    onClick={_ =>
                        parent
                     && (
                            parent.postMessage({type: "widget_active"},origin),
                            this.setState({viewState: "widget"})
                        )
                    }
                />
            )
        
        if (this.state.viewState == "outsideHours")
            return(
                <OutsideHours/>
            )

        return (null)
    }
};

