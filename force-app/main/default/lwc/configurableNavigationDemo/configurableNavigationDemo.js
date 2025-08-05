import { LightningElement, track } from 'lwc';

export default class ConfigurableNavigationDemo extends LightningElement {
    @track currentConfig = 'default';
    
    // Default configuration
    defaultMenuItems = [
        {
            id: 'home',
            label: 'Home',
            url: '/home',
            hasSubmenu: false,
            submenuItems: []
        },
        {
            id: 'applications',
            label: 'Applications',
            url: '/applications',
            hasSubmenu: false,
            submenuItems: []
        },
        {
            id: 'portfolio',
            label: 'Portfolio',
            url: '/portfolio',
            hasSubmenu: false,
            submenuItems: []
        },
        {
            id: 'serviceRequest',
            label: 'Service Request',
            url: '/service-request',
            hasSubmenu: true,
            submenuItems: [
                {
                    id: 'myServiceRequest',
                    label: 'My Service Request',
                    url: '/service-request/my-requests'
                },
                {
                    id: 'newRequest',
                    label: 'New Request',
                    url: '/service-request/new'
                },
                {
                    id: 'lodgeFeedback',
                    label: 'Lodge Feedback',
                    url: '/service-request/feedback'
                }
            ]
        },
        {
            id: 'knowledgePortal',
            label: 'Knowledge Portal',
            url: '/knowledge',
            hasSubmenu: false,
            submenuItems: []
        }
    ];

    defaultUserMenuItems = [
        {
            id: 'mySettings',
            label: 'My Settings',
            icon: 'utility:settings',
            url: '/settings'
        },
        {
            id: 'logout',
            label: 'Logout',
            icon: 'utility:logout',
            url: '/logout'
        }
    ];

    // Custom configuration
    customMenuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            url: '/dashboard',
            hasSubmenu: false,
            submenuItems: []
        },
        {
            id: 'reports',
            label: 'Reports',
            url: '/reports',
            hasSubmenu: true,
            submenuItems: [
                {
                    id: 'salesReport',
                    label: 'Sales Report',
                    url: '/reports/sales'
                },
                {
                    id: 'inventoryReport',
                    label: 'Inventory Report',
                    url: '/reports/inventory'
                }
            ]
        },
        {
            id: 'settings',
            label: 'Settings',
            url: '/settings',
            hasSubmenu: false,
            submenuItems: []
        }
    ];

    customUserMenuItems = [
        {
            id: 'profile',
            label: 'My Profile',
            icon: 'standard:user',
            url: '/profile'
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: 'utility:settings',
            url: '/settings'
        },
        {
            id: 'logout',
            label: 'Logout',
            icon: 'utility:logout',
            url: '/logout'
        }
    ];

    // Get current menu items based on configuration
    get currentMenuItems() {
        return this.currentConfig === 'default' ? this.defaultMenuItems : this.customMenuItems;
    }

    // Get current user menu items based on configuration
    get currentUserMenuItems() {
        return this.currentConfig === 'default' ? this.defaultUserMenuItems : this.customUserMenuItems;
    }

    // Handle configuration change
    handleConfigChange(event) {
        this.currentConfig = event.target.value;
    }

    // Get configuration options
    get configOptions() {
        return [
            { label: 'Default (Aussie Elevate)', value: 'default' },
            { label: 'Custom Configuration', value: 'custom' }
        ];
    }
} 