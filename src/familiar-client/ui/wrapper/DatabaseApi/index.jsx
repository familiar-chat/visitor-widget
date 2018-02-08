import React                             from "react"
import bind                              from "api-common/api/bind"
import * as organizationSiteApi          from "api-common/api/organization/site"
import * as organizationTriggerApi       from "api-common/api/organization/trigger"
import * as organizationVisitoGeneralApi from "api-common/api/organization/visitor/general"
import * as organizationCalendarApi      from "api-common/api/organization/calendar"
import * as visitorOrganizationApi       from "api-common/api/visitor/organization"
import * as visitorMessageApi            from "api-common/api/organization/visitor/general/message"
import * as visitorTriggerMessageApi     from "api-common/api/organization/visitor/general/trigger_message"
import * as visitorMessageImageApi       from "api-common/api/organization/visitor/general/message/image"
import * as visitorReceivedMessageApi    from "api-common/api/organization/visitor/general/received_message"
import config                            from "api-common/config"


export default class extends React.Component {
    componentWillMount() {
        this.setState({
            tokenSubscribeCertificate: undefined,
            token                    : undefined,
            userId                   : undefined
        })
    }

    componentDidMount() {
        (async _ => {
            let {
                tokenApi: {
                    read     : read,
                    subscribe: subscribe
                },
            } = this.props
            
            let params    = window.location.href.match(/^.*\?account_id=(.*)&origin=(.*)&pathname=(.*)/);
            let accountId = params[1];

            let onChangeToken = async token => {

                let organizations = (
                    token ? await visitorOrganizationApi.read({
                        token: token,
                        visitor : {
                            id: token.user.uid
                        }
                    })
                  :         []
                )

                this.setState({
                    organizationId: accountId,
                    token         : token,
                    userId        : organizations[0] && organizations[0].visitor_id
                })
            }

            this.setState({
                tokenSubscribeCertificate: await subscribe(onChangeToken),
            })

            onChangeToken(await read())
        })()
    }

    componentWillUnmount() {
        let {
            tokenApi: {
                unsubscribe: unsubscribe
            }
        } = this.props

        if(this.state.tokenSubscribeCertificate)
            unsubscribe(this.state.tokenSubscribeCertificate)
    }

    render() {
        let {
            render,
            ...props
        } = this.props

        if (!this.state.token) return null

        return render({
            organizationSiteApi: bind(organizationSiteApi, {
                organization: {
                    id: this.state.organizationId
                },
                token: this.state.token
            }),
            organizationTriggerApi: bind(organizationTriggerApi, {
                organization: {
                    id: this.state.organizationId
                },
                token: this.state.token
            }),
            organizationVisitorGeneralApi: bind(organizationVisitoGeneralApi, {
                organization: {
                    id: this.state.organizationId
                },
                visitor: {
                    id: this.state.userId
                },
                token: this.state.token
            }),
            organizationCalendarApi: bind(organizationCalendarApi,{
                organization: {
                    id: this.state.organizationId
                },
                token: this.state.token
            }),
            visitorMessageApi: bind(visitorMessageApi, {
                organization: {
                    id: this.state.organizationId
                },
                visitor: {
                    id: this.state.userId
                },
                token: this.state.token
            }),
            visitorMessageImageApi: bind(visitorMessageImageApi, {
                organization: {
                    id: this.state.organizationId
                },
                url : config.familiar.functions.url,
                visitor: {
                    id: this.state.userId
                },
                token: this.state.token
            }),
            visitorReceivedMessageApi: bind(visitorReceivedMessageApi, {
                organization: {
                    id: this.state.organizationId
                },
                visitor: {
                    id: this.state.userId
                },
                token: this.state.token
            }),
            visitorTriggerMessageApi: bind(visitorTriggerMessageApi, {
                organization: {
                    id: this.state.organizationId
                },
                visitor: {
                    id: this.state.userId
                },
                token: this.state.token
            }),
            getCurrentOrganizationId: _ => this.state.organizationId,
            getCurrentUserId: _ => this.state.userId,
            ...props
        })
    }
}