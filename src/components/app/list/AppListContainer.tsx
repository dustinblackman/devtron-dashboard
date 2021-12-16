import React, { Component } from 'react';
import { buildInitState, appListModal } from './appList.modal';
import { ServerErrors } from '../../../modals/commonTypes';
import { App, AppListProps, AppListState, OrderBy, SortBy } from './types';
import { URLS, ViewType } from '../../../config';
import { AppListView } from './AppListView';
import { getAppList } from '../service';
import { showError } from '../../common';
import { AppListViewType } from '../config';
import * as queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import './list.css';

class AppListContainer extends Component<AppListProps, AppListState>{
    abortController: AbortController;

    constructor(props) {
        super(props);
        this.state = {
            code: 0,
            view: AppListViewType.LOADING,
            errors: [],
            apps: [],
            size: 0,
            sortRule: {
                key: SortBy.APP_NAME,
                order: OrderBy.ASC
            },
            showCommandBar: false,
            offset: 0,
            pageSize: 20,
            expandedRow: false,
            appData: null,
            isAppCreated: false,
            appChecklist: undefined,
            chartChecklist: undefined,
            appStageCompleted: 0,
            chartStageCompleted: 0,
        }
    }

    componentDidMount() {
        let response = buildInitState(this.props.payloadParsedFromUrl, this.props.appCheckListRes, this.props.teamListRes, this.props.environmentListRes);
        this.setState({
            code: response.code,
            apps: [],
            offset: response.offset,
            size: 0,
            pageSize: response.size,
            sortRule: {
                key: response.sortBy,
                order: response.sortOrder,
            },
            isAppCreated: response.isAppCreated,
            appChecklist: response.appChecklist,
            chartChecklist: response.chartChecklist,
            appStageCompleted: response.appStageCompleted,
            chartStageCompleted: response.chartStageCompleted,
        });

        if (response.isAppCreated) {
            this.getAppList(this.props.payloadParsedFromUrl);
        }
        else {
            this.setState({ view: AppListViewType.EMPTY });
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps.payloadParsedFromUrl !=  this.props.payloadParsedFromUrl){
            this.getAppList(this.props.payloadParsedFromUrl);
        }
    }

    sort = (key: string): void => {
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        query["orderBy"] = key;
        query["sortOrder"] = query["sortOrder"] == OrderBy.ASC ? OrderBy.DESC : OrderBy.ASC;
        let queryStr = queryString.stringify(query);
        let url = `${URLS.APP_LIST_DEVTRON}?${queryStr}`;
        this.props.history.push(url);
    }

    clearAll = (): void => {
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        delete query['search'];
        delete query['environment'];
        delete query['team'];
        delete query['status'];
        let queryStr = queryString.stringify(query);
        let url = `${URLS.APP_LIST_DEVTRON}?${queryStr}`;
        this.props.history.push(url);
    }

    changePage = (pageNo: number): void => {
        let offset = this.state.pageSize * (pageNo - 1);
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        query['offset'] = offset;
        let queryStr = queryString.stringify(query);
        let url = `${URLS.APP_LIST_DEVTRON}?${queryStr}`;
        this.props.history.push(url);
    }

    changePageSize = (size: number): void => {
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        query['offset'] = 0;
        query['pageSize'] = size;
        let queryStr = queryString.stringify(query);
        let url = `${URLS.APP_LIST_DEVTRON}?${queryStr}`;
        this.props.history.push(url);
    }

    expandRow = (app: App | null): void => {
        this.setState({ expandedRow: true, appData: app });
    }

    closeExpandedRow = (): void => {
        this.setState({ expandedRow: false, appData: null });
    }

    getAppList = (request): void => {
        let isSearchOrFilterApplied = request.environments?.length || request.teams?.length || request.appNameSearch?.length;
        let state = { ...this.state };
        state.view = AppListViewType.LOADING;
        state.sortRule = {
            key: request.sortBy,
            order: request.sortOrder,
        }
        state.expandedRow = false;
        state.appData = null;
        this.setState(state);
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }

        this.abortController = new AbortController();

        getAppList(request, { signal: this.abortController.signal }).then((response) => {
            let view = AppListViewType.LIST;
            if (response.result.appCount === 0) {
                if (isSearchOrFilterApplied) view = AppListViewType.NO_RESULT;
                else view = AppListViewType.EMPTY;
            }
            let state = { ...this.state };
            state.code = response.code;
            state.apps = (response.result && !!response.result.appContainers) ? appListModal(response.result.appContainers) : [];
            state.view = view;
            state.offset = request.offset;
            state.size = response.result.appCount;
            state.pageSize = request.size;
            this.setState(state);
            this.abortController = null;
        }).catch((errors: ServerErrors) => {
            if (errors.code) {
                showError(errors);
                this.setState({ code: errors.code, view: ViewType.ERROR });
            }
        })
    }


    redirectToAppDetails = (app, envId: number): string => {
        if (envId) {
            return `/app/${app.id}/details/${envId}`;
        }
        return `/app/${app.id}/trigger`;
    }


    render() {
        return <AppListView
            {...this.state}
            match={this.props.match}
            location={this.props.location}
            history={this.props.history}
            expandRow={this.expandRow}
            closeExpandedRow={this.closeExpandedRow}
            sort={this.sort}
            redirectToAppDetails={this.redirectToAppDetails}
            clearAll={this.clearAll}
            changePage={this.changePage}
            changePageSize={this.changePageSize}
        />
    }
}

export default withRouter(AppListContainer)
