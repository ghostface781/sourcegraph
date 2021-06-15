import AlertCircleIcon from 'mdi-react/AlertCircleIcon'
import React, { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Markdown } from '@sourcegraph/shared/src/components/Markdown'
import { AggregateStreamingSearchResults } from '@sourcegraph/shared/src/search/stream'
import { renderMarkdown } from '@sourcegraph/shared/src/util/markdown'
import { buildSearchURLQuery } from '@sourcegraph/shared/src/util/url'

import { SearchPatternType } from '../../graphql-operations'

interface SearchAlertProps {
    alert: Required<AggregateStreamingSearchResults>['alert']
    patternType: SearchPatternType | undefined
    caseSensitive: boolean
    versionContext?: string
    searchContextSpec?: string
    children?: ReactNode[]
}

export const SearchAlert: React.FunctionComponent<SearchAlertProps> = ({
    alert,
    patternType,
    caseSensitive,
    versionContext,
    searchContextSpec,
    children,
}) => (
    <div className="alert alert-info m-2" data-testid="alert-container">
        <h3>
            <AlertCircleIcon className="redesign-d-none icon-inline" /> {alert.title}
        </h3>

        {alert.description && (
            <p>
                <Markdown dangerousInnerHTML={renderMarkdown(alert.description)} />
            </p>
        )}

        {alert.proposedQueries && (
            <>
                <h4>Did you mean:</h4>
                <ul className="list-unstyled">
                    {alert.proposedQueries.map(proposedQuery => (
                        <li key={proposedQuery.query}>
                            <Link
                                className="btn btn-secondary btn-sm"
                                data-testid="proposed-query-link"
                                to={
                                    '/search?' +
                                    buildSearchURLQuery(
                                        proposedQuery.query,
                                        patternType || SearchPatternType.literal,
                                        caseSensitive,
                                        versionContext,
                                        searchContextSpec
                                    )
                                }
                            >
                                {proposedQuery.query || proposedQuery.description}
                            </Link>
                            {proposedQuery.query && proposedQuery.description && ` — ${proposedQuery.description}`}
                        </li>
                    ))}
                </ul>
            </>
        )}

        {children}
    </div>
)
