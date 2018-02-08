import React            from "react"
import ErrorListener    from "familiar-client/ui/view/ErrorListener"
import MainLayout       from "familiar-client/ui/view/MainLayout"
import DatabaseApi      from "familiar-client/ui/wrapper/DatabaseApi"
import TokenApi         from "familiar-client/ui/wrapper/auth/TokenApi"


export default props =>
    <ErrorListener>
        <TokenApi
            render={props =>
                <DatabaseApi
                    render={props =>
                        <MainLayout
                            {...props}
                        />
                    }
                    {...props}
                />
            }
            {...props}
        />
    </ErrorListener>