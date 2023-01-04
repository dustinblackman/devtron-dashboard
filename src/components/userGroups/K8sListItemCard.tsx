import React, { useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import {
    ClearIndicator,
    convertToOptionsList,
    Option,
    MultiValueChipContainer,
    MultiValueRemove,
    processK8SObjects,
    selectAllfunction,
    showError,
} from '../common'
import {
    getClusterList,
    getResourceGroupList,
    getResourceList,
    namespaceListByClusterId,
} from '../ResourceBrowser/ResourceBrowser.service'
import { ResourceListPayloadType } from '../ResourceBrowser/Types'
import { multiSelectStyles } from '../v2/common/ReactSelectCustomization'
import { customValueContainer, formatOptionLabel, Option as SingleSelectOption } from '../v2/common/ReactSelect.utils'
import { ActionTypes, OptionType } from './userGroups.types'
import { ReactComponent as Clone } from '../../assets/icons/ic-copy.svg'
import { ReactComponent as Delete } from '../../assets/icons/ic-delete-interactive.svg'
import CreatableSelect from 'react-select/creatable'
import { k8sPermissionRoles } from './PermissionsUtils'

export default function K8sListItemCard({
    k8sPermission,
    handleK8sPermission,
    index,
    namespaceMapping,
    setNamespaceMapping,
    apiGroupMapping,
    setApiGroupMapping,
    kindMapping,
    setKindMapping,
    objectMapping,
    setObjectMapping,
}) {
    const [clusterOptions, setClusterOptions] = useState<OptionType[]>()
    const [processedData, setProcessedData] = useState<any>()

    useEffect(() => {
        getClusterListData()
    }, [])

    const getClusterListData = async () => {
        try {
            const { result } = await getClusterList()
            const _clusterOptions = convertToOptionsList(result, 'cluster_name', 'id')
            setClusterOptions(_clusterOptions)
        } catch (err) {
            showError(err)
        }
    }

    const getNamespaceList = async (clusterId: string) => {
        try {
            const { result } = await namespaceListByClusterId(clusterId)
            const _namespaceOptions = [
                { label: 'All Namespaces / Cluster', value: '*' },
                ...convertToOptionsList(result),
            ]
            setNamespaceMapping((prevMapping) => ({ ...prevMapping, [k8sPermission.key]: _namespaceOptions }))
        } catch (err) {
            showError(err)
        }
    }

    const getGroupKindData = async (clusterId, namespace): Promise<void> => {
        try {
            const { result: resourceGroupList } = await getResourceGroupList(clusterId)
            if (resourceGroupList) {
                const _processedData = processK8SObjects(resourceGroupList, '', true)
                const _k8SObjectMap = _processedData.k8SObjectMap
                const _k8SObjectList: OptionType[] = []
                for (const [key, value] of _k8SObjectMap.entries()) {
                    if (key) {
                        _k8SObjectList.push({ label: key, value: key })
                    }
                }
                setProcessedData(_k8SObjectMap)
                setApiGroupMapping((prevMapping) => ({
                    ...prevMapping,
                    [k8sPermission.key]: [
                        { label: 'All API groups', value: '*' },
                        { label: 'K8s core groups (eg. service, pod, etc.)', value: 'k8sempty' },
                        ..._k8SObjectList,
                    ],
                }))
            }
        } catch (err) {
            showError(err)
        }
    }

    const createKindData = (selected) => {
        const kind: OptionType[] = []
        if (selected.value === '*') {
            for (const [key, value] of processedData.entries()) {
                value.child.map((ele) => {
                    kind.push({ value: ele.gvk['Kind'], label: ele.gvk['Kind'] })
                })
            }
        } else {
            const data = processedData.get(selected.value === 'k8sempty' ? '' : selected.value)
            data?.child?.map((ele) => {
                if (ele.namespaced) {
                    kind.push({ label: ele.gvk['Kind'], value: ele.gvk['Kind'] })
                }
            })
        }
        setKindMapping((prevMapping) => ({
            ...prevMapping,
            [k8sPermission.key]: [{ label: 'All kind', value: '*' }, ...kind],
        }))
    }

    const getResourceListData = async (selected): Promise<void> => {
        try {
            const resource = processedData
                ?.get?.(k8sPermission.group.value === 'k8sempty' ? '' : k8sPermission.group.value)
                .child?.find((ele) => ele.gvk['Kind'] === selected.value)
            const resourceListPayload: ResourceListPayloadType = {
                clusterId: Number(k8sPermission?.cluster?.value),
                k8sRequest: {
                    resourceIdentifier: {
                        groupVersionKind: resource.gvk,
                    },
                },
            }
            const { result } = await getResourceList(resourceListPayload)
            setObjectMapping((prevMapping) => ({
                ...prevMapping,
                [k8sPermission.key]: [
                    { label: 'All object', value: '*' },
                    ...result.data.map((ele) => {
                        return { label: ele['name'], value: ele['name'] }
                    }),
                ],
            }))
        } catch (err) {
            showError(err)
        }
    }

    const onClusterChange = (selected) => {
        if (selected.value !== k8sPermission?.cluster?.value) {
            handleK8sPermission('onClusterChange', index, selected)
            getNamespaceList(selected.value)
        }
    }

    const onNameSpaceSelection = (selected) => {
        if (selected.value !== k8sPermission.namespace?.value) {
            handleK8sPermission('onNamespaceChange', index, selected)
            getGroupKindData(k8sPermission?.cluster?.value, selected.value)
        }
    }

    const onApiGroupSelect = (selected) => {
        if (selected.value !== k8sPermission.group?.value) {
            handleK8sPermission('onApiGroupChange', index, selected)
            createKindData(selected)
        }
    }

    const onKindSelect = (selected) => {
        if (selected.value !== k8sPermission.kind?.value) {
            handleK8sPermission('onKindChange', index, selected)
            if (selected.value !== '*' && k8sPermission.group.value !== '*') {
                getResourceListData(selected)
            } else {
                setObjectMapping((prevMapping) => ({
                    ...prevMapping,
                    [k8sPermission.key]: [{ label: 'All object', value: '*' }],
                }))
            }
        }
    }

    const onObjectChange = (selected, actionMeta) => {
        selectAllfunction(
            selected,
            actionMeta,
            (options) => handleK8sPermission('onObjectChange', index, options),
            objectMapping,
        )
    }

    const setRoleSelection = (selected) => {
        if (selected.value !== k8sPermission.action?.value) {
            handleK8sPermission('onRoleChange', index, selected)
        }
    }

    const clonePermission = () => {
        handleK8sPermission('clone',index)
    }

    const deletePermission = () => {
        handleK8sPermission('delete',index)
    }

    return (
        <div className="mt-16 mb-16 dc__border br-4 p-16 bcn-0">
            <div className="cn-6 mb-6 flex dc__content-space">
                <span>Cluster</span>
                <span className="flex">
                    <Clone className="icon-dim-16 mr-4 cursor" onClick={clonePermission} />
                    <Delete className="icon-dim-16 cursor"onClick={deletePermission} />
                </span>
            </div>
            <div className="mb-16">
                <ReactSelect
                    placeholder="Select cluster"
                    options={clusterOptions}
                    value={k8sPermission?.cluster}
                    onChange={onClusterChange}
                    name="cluster"
                    components={{
                        IndicatorSeparator: null,
                        Option: SingleSelectOption,
                    }}
                    styles={{
                        ...multiSelectStyles,
                        control: (base) => ({
                            ...base,
                            minHeight: '36px',
                            fontWeight: '400',
                            backgroundColor: 'var(--N50)',
                            cursor: 'pointer',
                        }),
                        dropdownIndicator: (base) => ({
                            ...base,
                            padding: '0 8px',
                        }),
                    }}
                />
            </div>
            {k8sPermission?.cluster && (
                <>
                    <div className="cn-6 mb-6">Namespace</div>
                    <div className="mb-16">
                        <CreatableSelect
                            placeholder="Select namespace"
                            options={namespaceMapping?.[k8sPermission.key]}
                            value={k8sPermission.namespace}
                            name="namespace"
                            onChange={onNameSpaceSelection}
                            components={{
                                IndicatorSeparator: null,
                                Option: SingleSelectOption,
                            }}
                            styles={{
                                ...multiSelectStyles,
                                control: (base) => ({
                                    ...base,
                                    minHeight: '36px',
                                    fontWeight: '400',
                                    backgroundColor: 'var(--N50)',
                                    cursor: 'pointer',
                                }),
                                dropdownIndicator: (base) => ({
                                    ...base,
                                    padding: '0 8px',
                                }),
                            }}
                        />
                    </div>
                    <div className="flexbox w-100">
                        <div className="w-100 mr-6">
                            <div className="cn-6 mb-6">API Group</div>
                            <div className="mb-16">
                                <ReactSelect
                                    placeholder="Select API group"
                                    options={apiGroupMapping?.[k8sPermission.key]}
                                    name="Api group"
                                    value={k8sPermission.group}
                                    onChange={onApiGroupSelect}
                                    components={{
                                        IndicatorSeparator: null,
                                        Option: SingleSelectOption,
                                    }}
                                    styles={{
                                        ...multiSelectStyles,
                                        control: (base) => ({
                                            ...base,
                                            minHeight: '36px',
                                            fontWeight: '400',
                                            backgroundColor: 'var(--N50)',
                                            cursor: 'pointer',
                                        }),
                                        dropdownIndicator: (base) => ({
                                            ...base,
                                            padding: '0 8px',
                                        }),
                                    }}
                                />
                            </div>
                        </div>
                        <div className="w-100 ml-6">
                            <div className="cn-6 mb-6">Kind</div>
                            <div className="mb-16">
                                <ReactSelect
                                    placeholder="Select kind"
                                    options={kindMapping?.[k8sPermission.key]}
                                    value={k8sPermission.kind}
                                    onChange={onKindSelect}
                                    name="kind"
                                    components={{
                                        IndicatorSeparator: null,
                                        Option: SingleSelectOption,
                                    }}
                                    styles={{
                                        ...multiSelectStyles,
                                        control: (base) => ({
                                            ...base,
                                            minHeight: '36px',
                                            fontWeight: '400',
                                            backgroundColor: 'var(--N50)',
                                            cursor: 'pointer',
                                        }),
                                        dropdownIndicator: (base) => ({
                                            ...base,
                                            padding: '0 8px',
                                        }),
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="cn-6 mb-6">Object name</div>
                    <div className="mb-16">
                        <CreatableSelect
                            placeholder="Select object"
                            options={objectMapping?.[k8sPermission.key]}
                            value={k8sPermission.resource}
                            name="Object name"
                            onChange={onObjectChange}
                            components={{
                                IndicatorSeparator: () => null,
                                MultiValueContainer: ({ ...props }) => (
                                    <MultiValueChipContainer {...props} validator={null} />
                                ),
                                ClearIndicator,
                                MultiValueRemove,
                                Option,
                            }}
                            closeMenuOnSelect={false}
                            isMulti
                            hideSelectedOptions={false}
                            styles={{
                                ...multiSelectStyles,
                                dropdownIndicator: (base, state) => ({
                                    ...base,
                                    transition: 'all .2s ease',
                                    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                }),
                                multiValue: (base) => ({
                                    ...base,
                                    border: `1px solid var(--N200)`,
                                    borderRadius: `4px`,
                                    background: 'white',
                                    height: '30px',
                                    margin: '0 8px 0 0',
                                    padding: '1px',
                                }),
                            }}
                        />
                    </div>
                    <div className="cn-6 mb-6">Role</div>
                    <div className="mb-16 w-300">
                        <ReactSelect
                            placeholder="Select role"
                            options={k8sPermissionRoles}
                            value={k8sPermission.action}
                            defaultValue={k8sPermissionRoles[0]}
                            onChange={setRoleSelection}
                            formatOptionLabel={formatOptionLabel}
                            components={{
                                ClearIndicator: null,
                                IndicatorSeparator: null,
                                ValueContainer: customValueContainer
                            }}
                            styles={{
                                ...multiSelectStyles,
                                control: (base) => ({
                                    ...base,
                                    minHeight: '36px',
                                    fontWeight: '400',
                                    backgroundColor: 'var(--N50)',
                                    cursor: 'pointer',
                                }),
                                dropdownIndicator: (base) => ({
                                    ...base,
                                    padding: '0 8px',
                                }),
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
