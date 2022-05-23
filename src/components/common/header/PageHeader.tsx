import React from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Question } from '../../../assets/icons/ic-help-outline.svg'

export interface PageHeaderType {
    headerName: string
    buttonText?: string
    onClickCreateButton?: () => void
    isTippyShown?: boolean
    showCreateButton?: boolean
    tippyRedirectLink?: string
}

function PageHeader({
    headerName,
    buttonText,
    onClickCreateButton,
    isTippyShown = false,
    showCreateButton = false,
    tippyRedirectLink,
}: PageHeaderType) {
    return (
        <div className={`page-header flex content-space cn-9 bcn-0 pl-20 pr-20`}>
            <h1 className="page-header__title flex left fs-14 fw-6 lh-20">
                {headerName}
                {isTippyShown && (
                    <Tippy
                        className="default-tt "
                        arrow={false}
                        placement="top"
                        content={<span style={{ display: 'block', width: '66px' }}> Learn more </span>}
                    >
                        <a
                            className="learn-more__href flex"
                            href={tippyRedirectLink}
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            <Question className="icon-dim-20 ml-16 cursor" />
                        </a>
                    </Tippy>
                )}
            </h1>
            {showCreateButton && (
                <button type="button" className="cta h-32 lh-n" onClick={() => onClickCreateButton()}>
                    Create {buttonText}
                    <span className="round-button__icon">
                        <i className="fa fa-caret-down" aria-hidden="true"></i>
                    </span>
                </button>
            )}
        </div>
    )
}

export default PageHeader
