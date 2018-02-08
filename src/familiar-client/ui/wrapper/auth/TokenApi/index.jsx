import React                                   from "react"
import config                                  from "api-common/config"
import * as connectionStateApi                 from "api-common/api/info/connected"
import * as organizationVisitorApi             from "api-common/api/organization/visitor"
import * as organizationVisitorgGeneralApi     from "api-common/api/organization/visitor/general"
import * as organizationVisitorConnectionApi   from "api-common/api/organization/visitor/general/connection"
import * as visitorOrganizationApi             from "api-common/api/visitor/organization"


let toSendData = (event) => 
    JSON.parse(JSON.stringify({
        document: {
            referrer: event.documentReferrer,
            domain  : event.documentDomain,
        },
        location: {
            host: event.locationHost,
            hostname: event.locationHostname,
            pathname: event.locationPathname
        },
        navigator: {
            app_code_name: event.navigatorAppCodeName,
            app_name     : event.navigatorAppName,
            app_version  : event.navigatorAppVersion,
            language     : event.navigatorLanguage,
            platform     : event.navigatorPlatform,
            user_agent   : event.navigatorUserAgent,
        },
        screen: {
            width: event.screenWidth,
            height: event.screenHeight,
            color_depth: event.colorDepth
        }
    }))


export default class extends React.Component {
    componentWillMount() {
        this.setState({
            token        : undefined,
            subscribers  : [],
            parentWindow : undefined,
            origin       : undefined,
            triggerInfo  : undefined
        })
    }

    componentDidMount() {
        (async _ => {
            try {
                let params       = window.location.href.match(/^.*\?account_id=(.*)&origin=(.*)&pathname=(.*)/)
                let parentWindow = parent.postMessage ? parent : (parent.document.postMessage ? parent.document : undefined)
                let accountId    = params[1]
                let origin       = params[2]

                let storageToken = localStorage.getItem("token-" + accountId)

                let token;
                let visitorGeneral;
                let visitorId;

                if (storageToken) {
                    token = await new Promise((resolve, reject) => {
                        let app = firebase.initializeApp(
                            config.familiar.firebase,
                            JSON.parse(storageToken).appName
                        )

                        let auth = firebase.auth(app)

                        let unsubscribe = auth.onAuthStateChanged(user => {
                            unsubscribe()

                            resolve({
                                app : app,
                                type: "firebase",
                                user: user
                            })
                        })
                    })

                    if (token.user) {
                        let organizations = (
                            token ? await visitorOrganizationApi.read({
                                token: token,
                                visitor : {
                                    id: token.user.uid
                                }
                            })
                          :         []
                        )
                        
                        visitorId = organizations[0] && organizations[0].visitor_id

                        visitorGeneral = await organizationVisitorgGeneralApi.read({
                            visitor:{
                                id: visitorId
                            },
                            organization: {
                                id: accountId
                            },
                            token
                        })

                        let lastConnection = visitorGeneral.connections[visitorGeneral.connections.length - 1]
                        let visitCount = parseInt(visitorGeneral.visit_count || 0)

                        if (lastConnection && lastConnection.disconnected_date < new Date().getTime() - 180000) {
                            visitCount = visitCount + 1
                        }

                        await organizationVisitorgGeneralApi.update({
                            general: {
                                visit_count: visitCount,
                                updated_date: new Date().getTime(),
                            },
                            organization: {
                                id: accountId
                            },
                            token,
                            visitor: {
                                id: visitorId,
                            }
                        })

                    } else {
                        localStorage.removeItem("token-" + accountId);
                        storageToken = undefined
                    }
                }
                
                if(!storageToken) {
                    let app = firebase.initializeApp(
                        config.familiar.firebase,
                        Math.random().toString()
                    )

                    let email = "visitor."
                              + accountId
                              + "."
                              + new Date().getTime() 
                              + "@"
                              + Math.random().toString(36).slice(-8)
                              + "."
                              + Math.random().toString(36).slice(-8)

                    let password =  Math.random().toString(36).slice(-8)

                    await firebase.auth(app).createUserWithEmailAndPassword(email, password)

                    let user = await firebase.auth(app).signInWithEmailAndPassword(email, password)

                    localStorage.setItem(
                        "token-" + accountId,
                        JSON.stringify({
                            type   : "firebase",
                            appName: app.name
                        })
                    )

                    token = {
                        app    : app,
                        type   : "firebase",
                        user   : user
                    }

                    let date = new Date()
                    visitorId = await visitorOrganizationApi.add({
                        visitor:{
                            id: token.user.uid,
                            general: {
                                name    : ("0" + (date.getMonth() + 1)).slice(-2)
                                        + "-"
                                        + ("0" + date.getDate()).slice(-2)
                                        + "-"
                                        + ("0" + date.getHours()).slice(-2)
                                        + "-"
                                        + ("0" + date.getMinutes()).slice(-2) 
                                        + "-"
                                        + ("0" + date.getSeconds()).slice(-2)
                                ,
                                visit_count: 1,
                                created_date: date.getTime(),
                                updated_date: date.getTime()
                            }
                        },
                        organization: {
                            id: accountId
                        },
                        token: token
                    })
                }

                let visitorInfo = await new Promise((resolve, reject) => {
                    window.addEventListener(
                        "message",
                        event => {
                            if (event.origin !== origin)
                                return;

                            resolve(toSendData(event.data))
                        },
                        false
                    )
                    parentWindow.postMessage({type: "location_request"},  origin)
                })
                
                await organizationVisitorgGeneralApi.update({
                    general: {
                        updated_date: new Date().getTime(),
                        ...visitorInfo
                    },
                    visitor: {
                        id: visitorId,
                    },
                    organization: {
                        id: accountId
                    },
                    token: token,
                })

                this.setState({
                    triggerInfo: {
                        visitor   : visitorInfo,
                        visitCount: (parseInt(visitorGeneral && visitorGeneral.visit_count) || 0) + 1
                    }
                })
                
                let visitorConnection = await organizationVisitorConnectionApi.create({
                    connection: {
                        connected_date   : new Date().getTime(),
                        connected        : true,
                        url              : visitorInfo.location.pathname
                    },
                    visitor     : {
                        id: visitorId
                    },
                    organization: {
                        id: accountId
                    },
                    token
                })

                connectionStateApi.subscribe({
                    subscriber: async x => {
                        if (x === true) {
                            await organizationVisitorConnectionApi.update({
                                connection  : {
                                    id: visitorConnection.key,
                                    connected        : true
                                },
                                visitor     : {
                                    id: visitorId
                                },
                                organization: {
                                    id: accountId
                                },
                                token
                            })

                            await organizationVisitorConnectionApi.updateOnDisconnect({
                                connection: {
                                    id: visitorConnection.key,
                                    connected: false,
                                    disconnected_date: firebase.database.ServerValue.TIMESTAMP
                                },
                                visitor     : {
                                    id: visitorId
                                },
                                organization: {
                                    id: accountId
                                },
                                token
                            })
                        }
                    },
                    token
                })

                await organizationVisitorConnectionApi.updateOnDisconnect({
                    connection: {
                        id: visitorConnection.key,
                        connected: false,
                        disconnected_date: firebase.database.ServerValue.TIMESTAMP
                    },
                    visitor     : {
                        id: visitorId
                    },
                    organization: {
                        id: accountId
                    },
                    token
                })

                this.setState({
                    token,
                    parentWindow,
                    origin,
                    pathname: params[3]
                })

                for (let f of this.state.subscribers)
                    f(token)
                

            } catch (e) {
                // todo storage error
                localStorage.clear()
                console.log(e)
                throw e
                console.log("error please page reload")
            }

        })()
    }

    render() {
        let {
            render,
            ...props
        } = this.props

        return render({
            tokenApi: {
                create: async ({
                    staySignedIn,
                    email,
                    password               
                }) => {
                    let app = (_ => {
                        while (true) {
                            try {
                                return firebase.initializeApp(
                                    config.familiar.firebase,
                                    Math.random().toString()
                                )
                            } catch (e) {

                            }
                        }
                    })()

                    let user = await (async _ => {
                        try {
                            return await firebase.auth(app).signInWithEmailAndPassword(
                                email,
                                password
                            )
                        } catch (e) {
                            app.delete()

                            throw e
                        }
                    })()

                    localStorage.setItem(
                        "token-" + this.state.accountId,
                        JSON.stringify({
                            type   : "firebase",
                            appName: app.name
                        })
                    )

                    await new Promise(resolve => 
                        this.setState(
                            {
                                token: {
                                    app : app,
                                    type: "firebase",
                                    user: user
                                }
                            },
                            resolve
                        )
                    )

                    for (let f of this.state.subscribers)
                        f(this.state.token)
                },
                delete: x => new Promise(resolve => {

                    if (this.state.token == x)
                        this.setState(
                            {
                                token: undefined
                            },
                            _ => {
                                firebase.auth(x.app).signOut()

                                for (let f of this.state.subscribers)
                                    f(this.state.token)
                                
                                resolve()
                            }
                        )
                    else
                        resolve()
                }),
                read: _ => this.state.token,
                subscribe: f => new Promise(resolve => 
                    this.setState(
                        {
                            subscribers: this.state.subscribers.concat(f)
                        },
                        _ => resolve(f)
                    )
                ),
                unsubscribe :  certificate => new Promise(resolve => {
                    let i = this.state.subscribers.findIndex(certificate)

                    if (i >= 0)
                        this.setState(
                            {
                                subscribers: this.state.subscribers.slice(0, i).concat(
                                    this.state.subscribers.slice(i)
                                )
                            },
                            resolve
                        )
                    else
                        resolve()
                })
            },
            origin        : this.state.origin,
            parent        : this.state.parentWindow,
            pathname      : this.state.pathname,
            getTriggerInfo: _ => this.state.triggerInfo,
            ...props
        })
    }
}
