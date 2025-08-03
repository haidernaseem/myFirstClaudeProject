import { LightningElement, track, wire, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class CustomerPortalNavigation extends NavigationMixin(LightningElement) {
    @api userName = 'John Doe';
    @api userAvatar = '';
    
    @track showMobileMenu = false;
    @track showUserMenu = false;
    @track menuItems = [];

    connectedCallback() {
        this.initializeMenuItems();
    }

    initializeMenuItems() {
        this.menuItems = [
            {
                id: 'dashboard',
                label: 'Dashboard',
                icon: 'utility:home',
                isActive: true,
                hasSubmenu: false,
                showSubmenu: false,
                url: '/dashboard'
            },
            {
                id: 'accounts',
                label: 'My Accounts',
                icon: 'standard:account',
                isActive: false,
                hasSubmenu: true,
                showSubmenu: false,
                submenuItems: [
                    {
                        id: 'account-overview',
                        label: 'Account Overview',
                        icon: 'utility:list',
                        url: '/accounts/overview'
                    },
                    {
                        id: 'account-details',
                        label: 'Account Details',
                        icon: 'utility:edit',
                        url: '/accounts/details'
                    },
                    {
                        id: 'billing-info',
                        label: 'Billing Information',
                        icon: 'utility:credit_card',
                        url: '/accounts/billing'
                    }
                ]
            },
            {
                id: 'orders',
                label: 'Orders',
                icon: 'standard:orders',
                isActive: false,
                hasSubmenu: true,
                showSubmenu: false,
                submenuItems: [
                    {
                        id: 'order-history',
                        label: 'Order History',
                        icon: 'utility:list',
                        url: '/orders/history'
                    },
                    {
                        id: 'track-order',
                        label: 'Track Order',
                        icon: 'utility:location',
                        url: '/orders/track'
                    },
                    {
                        id: 'returns',
                        label: 'Returns & Refunds',
                        icon: 'utility:undo',
                        url: '/orders/returns'
                    }
                ]
            },
            {
                id: 'support',
                label: 'Support',
                icon: 'standard:case',
                isActive: false,
                hasSubmenu: true,
                showSubmenu: false,
                submenuItems: [
                    {
                        id: 'create-case',
                        label: 'Create Case',
                        icon: 'utility:add',
                        url: '/support/create-case'
                    },
                    {
                        id: 'my-cases',
                        label: 'My Cases',
                        icon: 'utility:list',
                        url: '/support/my-cases'
                    },
                    {
                        id: 'knowledge-base',
                        label: 'Knowledge Base',
                        icon: 'utility:knowledge_base',
                        url: '/support/knowledge'
                    },
                    {
                        id: 'contact-us',
                        label: 'Contact Us',
                        icon: 'utility:phone',
                        url: '/support/contact'
                    }
                ]
            },
            {
                id: 'documents',
                label: 'Documents',
                icon: 'standard:file',
                isActive: false,
                hasSubmenu: false,
                showSubmenu: false,
                url: '/documents'
            }
        ];
    }

    // Mobile menu toggle
    toggleMobileMenu() {
        this.showMobileMenu = !this.showMobileMenu;
    }

    // User menu toggle
    toggleUserMenu() {
        this.showUserMenu = !this.showUserMenu;
    }

    // Handle main menu clicks
    handleMenuClick(event) {
        const menuId = event.currentTarget.dataset.id;
        const menuItem = this.menuItems.find(item => item.id === menuId);
        
        if (menuItem) {
            // Update active state
            this.menuItems.forEach(item => {
                item.isActive = item.id === menuId;
            });

            // For desktop, don't toggle submenu on click - let CSS handle hover
            // For mobile, we'll handle submenu toggling in mobile handler
            if (!menuItem.hasSubmenu) {
                // Navigate to the page
                this.navigateToPage(menuItem.url);
            }
        }
    }

    // Handle mobile menu clicks
    handleMobileMenuClick(event) {
        const menuId = event.currentTarget.dataset.id;
        const menuItem = this.menuItems.find(item => item.id === menuId);
        
        if (menuItem) {
            // Update active state
            this.menuItems.forEach(item => {
                item.isActive = item.id === menuId;
            });

            // Toggle submenu if it has one
            if (menuItem.hasSubmenu) {
                menuItem.showSubmenu = !menuItem.showSubmenu;
            } else {
                // Navigate to the page and close mobile menu
                this.navigateToPage(menuItem.url);
                this.showMobileMenu = false;
            }
        }
    }

    // Handle submenu clicks
    handleSubmenuClick(event) {
        const submenuId = event.currentTarget.dataset.id;
        // Find the submenu item and navigate
        this.menuItems.forEach(menuItem => {
            if (menuItem.submenuItems) {
                const subItem = menuItem.submenuItems.find(sub => sub.id === submenuId);
                if (subItem) {
                    this.navigateToPage(subItem.url);
                }
            }
        });
    }

    // Handle mobile submenu clicks
    handleMobileSubmenuClick(event) {
        const submenuId = event.currentTarget.dataset.id;
        // Find the submenu item and navigate
        this.menuItems.forEach(menuItem => {
            if (menuItem.submenuItems) {
                const subItem = menuItem.submenuItems.find(sub => sub.id === submenuId);
                if (subItem) {
                    this.navigateToPage(subItem.url);
                    this.showMobileMenu = false;
                }
            }
        });
    }

    // Handle user menu clicks
    handleUserMenuClick(event) {
        const action = event.currentTarget.dataset.action;
        
        switch(action) {
            case 'profile':
                this.navigateToPage('/profile');
                break;
            case 'settings':
                this.navigateToPage('/settings');
                break;
            case 'logout':
                this.handleLogout();
                break;
        }
        
        this.showUserMenu = false;
    }

    // Navigate to a page
    navigateToPage(url) {
        // In a real implementation, you would use NavigationMixin
        // For demo purposes, we'll just log the navigation
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
        // Add click outside listener for mobile menu
        document.addEventListener('click', (event) => {
            const navElement = this.template.querySelector('.customer-portal-nav');
            if (navElement && !navElement.contains(event.target)) {
                this.showMobileMenu = false;
                this.showUserMenu = false;
            }
        });
    }
} 