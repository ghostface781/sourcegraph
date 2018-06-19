import { upperFirst } from 'lodash'
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { Subscription } from 'rxjs'
import * as GQL from '../backend/graphqlschema'
import { PageTitle } from '../components/PageTitle'
import { SettingsFile } from '../settings/SettingsFile'
import { eventLogger } from '../tracking/eventLogger'
import { fetchSiteSettings, updateSiteSettings } from './backend'

interface Props extends RouteComponentProps<any> {
    user: GQL.IUser
    isLightTheme: boolean
}

interface State {
    settings?: GQL.ISettings | null
    error?: string
    commitError?: Error
}

export class SiteAdminSettingsPage extends React.Component<Props, State> {
    public state: State = {}

    private subscriptions = new Subscription()

    public componentDidMount(): void {
        eventLogger.logViewEvent('UserSettingsConfiguration')

        this.subscriptions.add(
            fetchSiteSettings().subscribe(
                settings => this.setState({ settings }),
                error => this.setState({ error: error.message })
            )
        )
    }

    public componentWillUnmount(): void {
        this.subscriptions.unsubscribe()
    }

    public render(): JSX.Element | null {
        return (
            <div className="user-settings-configuration-page">
                <PageTitle title="Site settings - Admin" />
                <h2>Configuration</h2>
                {this.state.error && <div className="alert alert-danger">{upperFirst(this.state.error)}</div>}
                <p>
                    Global settings apply to all organizations and users. Settings for a user or organization override
                    global settings.
                </p>
                {this.state.settings !== undefined && (
                    <SettingsFile
                        settings={this.state.settings}
                        onDidCommit={this.onDidCommit}
                        onDidDiscard={this.onDidDiscard}
                        commitError={this.state.commitError}
                        history={this.props.history}
                        isLightTheme={this.props.isLightTheme}
                    />
                )}
            </div>
        )
    }

    private onDidCommit = (lastID: number | null, contents: string): void => {
        this.setState({
            error: undefined,
            commitError: undefined,
        })
        updateSiteSettings(lastID, contents).subscribe(
            settings =>
                this.setState({
                    error: undefined,
                    commitError: undefined,
                    settings,
                }),
            error => {
                this.setState({ error: undefined, commitError: error })
                console.error(error)
            }
        )
    }

    private onDidDiscard = (): void => {
        this.setState({ commitError: undefined })
    }
}
