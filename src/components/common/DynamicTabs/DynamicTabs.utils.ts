import { TabsDataType } from './DynamicTabs.type'

export const COMMON_TABS_SELECT_STYLES = {
    control: (base) => ({
        ...base,
        borderRadius: '4px 4px 0 0',
        borderBottom: 'none',
        boxShadow: 'none',
        cursor: 'text',
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '2px 32px',
    }),
    menu: (base) => ({
        ...base,
        marginTop: 0,
        borderRadius: '0 0 4px 4px',
        width: '298px',
        marginLeft: '1px',
        overflow: 'hidden',
    }),
    menuList: (base) => ({
        ...base,
        maxHeight: 'calc(100vh - 200px)',
        paddingTop: 0,
    }),
    noOptionsMessage: (base) => ({
        ...base,
        color: 'var(--N600)',
    }),
}

export const EMPTY_TABS_DATA = {
    fixedTabs: [],
    dynamicTabs: [],
}

export const initTabsData = (
    tabs: any[],
    setTabsData: React.Dispatch<React.SetStateAction<TabsDataType>>,
    setSelectedTab: React.Dispatch<React.SetStateAction<any>>,
): void => {
    const fixedTabs = []
    const dynamicTabs = []
    for (const tab of tabs) {
        const tabOption = {
            ...tab,
            label: tab.name,
            value: tab.title,
        }
        if (tab.positionFixed) {
            fixedTabs.push(tabOption)
        } else {
            dynamicTabs.push(tabOption)
        }

        if (tabOption.isSelected) {
            setSelectedTab(tabOption)
        }
    }

    setTabsData({
        fixedTabs,
        dynamicTabs,
    })
}

export const computeAndToggleMoreOptions = (
    tabsSectionRef: React.MutableRefObject<HTMLDivElement>,
    fixedContainerRef: React.MutableRefObject<HTMLDivElement>,
    dynamicWrapperRef: React.MutableRefObject<HTMLUListElement>,
    isMenuOpen: boolean,
    setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const moreButtonEle = tabsSectionRef.current?.querySelector('.more-tabs-wrapper')
    if (!tabsSectionRef.current || !fixedContainerRef.current || !dynamicWrapperRef.current || !moreButtonEle) {
        return
    }

    const primaryItems = dynamicWrapperRef.current.querySelectorAll('li') as NodeListOf<HTMLLIElement>
    let stopWidth = 0 // init with more options button width
    const hiddenItems = []
    const primaryWidth = tabsSectionRef.current.offsetWidth - fixedContainerRef.current.offsetWidth

    // Compute the stop width & get hidden indices
    primaryItems.forEach((item, i) => {
        if (primaryWidth >= stopWidth + item.offsetWidth) {
            stopWidth += item.offsetWidth
        } else {
            hiddenItems.push(i)
        }
    })

    // Toggle the visibility of More button and items in Secondary
    if (!hiddenItems.length) {
        moreButtonEle.classList.add('hide-more-tabs-option')
    } else {
        moreButtonEle.classList.remove('hide-more-tabs-option')

        if (isMenuOpen) {
            setIsMenuOpen(false)
        }
    }
}
