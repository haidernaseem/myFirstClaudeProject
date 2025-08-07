import { LightningElement, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class ConfigurableNavigation extends NavigationMixin(LightningElement) {
    @api logoIcon = 'utility:home';
    @api logoText = 'Aussie';
    @api logoSubText = 'Elevate';
    @api logoImage = '';
    @api primaryColor = '#4A4A8C';
    @api secondaryColor = '#FFD700';
    @api textColor = '#4A4A8C';
    @api backgroundGradient = 'linear-gradient(135deg, #4A4A8C 0%, #6B6BA8 100%)';
    @api userName = 'User170486240...';
    @api userAvatar = '';
    @api showNotifications = false;
    
    @track showNotificationsMenu = false;
    @track activeMenuItem = 'home';
    
    // Default menu configuration
    @api menuItems = [
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

    // User menu items
    @api userMenuItems = [
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

    connectedCallback() {
        // Parse menu items if passed as string
        if (typeof this.menuItems === 'string') {
            try {
                this.menuItems = JSON.parse(this.menuItems);
            } catch (error) {
                console.error('Error parsing menu items:', error);
            }
        }
        
        // Parse user menu items if passed as string
        if (typeof this.userMenuItems === 'string') {
            try {
                this.userMenuItems = JSON.parse(this.userMenuItems);
            } catch (error) {
                console.error('Error parsing user menu items:', error);
            }
        }
    }



    // Toggle notifications menu
    toggleNotificationsMenu() {
        this.showNotificationsMenu = !this.showNotificationsMenu;
        if (this.showNotificationsMenu) {
            this.showUserMenu = false;
        }
    }

    // Handle menu item click
    handleMenuClick(event) {
        const menuId = event.currentTarget.dataset.id;
        const menuItem = this.menuItems.find(item => item.id === menuId);
        
        if (menuItem) {
            if (menuItem.hasSubmenu) {
                // Toggle submenu for items with submenus
                this.menuItems.forEach(item => {
                    if (item.id !== menuId) {
                        item.showSubmenu = false;
                    }
                });
                menuItem.showSubmenu = !menuItem.showSubmenu;
            } else {
                // Navigate for items without submenus
                this.activeMenuItem = menuId;
                this.navigateToPage(menuItem.url);
            }
        }
    }

    // Handle submenu item click
    handleSubmenuClick(event) {
        const submenuId = event.currentTarget.dataset.id;
        const parentId = event.currentTarget.dataset.parent;
        
        // Find the submenu item
        const parentMenuItem = this.menuItems.find(item => item.id === parentId);
        if (parentMenuItem && parentMenuItem.submenuItems) {
            const subItem = parentMenuItem.submenuItems.find(sub => sub.id === submenuId);
            if (subItem) {
                this.navigateToPage(subItem.url);
            }
        }
    }

    // Handle user menu item click
    handleUserMenuClick(event) {
        const menuId = event.currentTarget.dataset.id;
        const menuItem = this.userMenuItems.find(item => item.id === menuId);
        
        if (menuItem) {
            if (menuId === 'logout') {
                this.handleLogout();
            } else {
                this.navigateToPage(menuItem.url);
            }
        }
    }

    // Navigate to a page
    navigateToPage(url) {
        console.log('Navigating to:', url);
        
        // Example of how to use NavigationMixin in a real scenario:
        // this[NavigationMixin.Navigate]({
        //     type: 'standard__webPage',
        //     attributes: {
        //         url: url
        //     }
        // });
    }

    // Handle logout
    handleLogout() {
        console.log('Logging out...');
        // In a real implementation, you would handle logout logic
        // This could involve calling an Apex method or redirecting to logout URL
    }

    // Close menus when clicking outside
    renderedCallback() {
        // Add click outside listener
        document.addEventListener('click', (event) => {
            const navElement = this.template.querySelector('.configurable-nav');
            if (navElement && !navElement.contains(event.target)) {
                this.showNotificationsMenu = false;
                // Close all submenus
                this.menuItems.forEach(item => {
                    item.showSubmenu = false;
                });
            }
        });
    }

    // Get computed styles for dynamic theming
    get navStyles() {
        return `
            --primary-color: ${this.primaryColor};
            --secondary-color: ${this.secondaryColor};
            --text-color: ${this.textColor};
            --background-gradient: ${this.backgroundGradient};
        `;
    }

    // Get menu items with active state
    get menuItemsWithState() {
        return this.menuItems.map(item => ({
            ...item,
            isActive: this.activeMenuItem === item.id,
            showSubmenu: item.showSubmenu || false
        }));
    }
    
    // Get user menu items with state
    get userMenuItemsWithState() {
        return this.userMenuItems || [];
    }
} 