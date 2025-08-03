# Customer Portal Navigation Component

A modern, responsive Lightning Web Component that mimics a customer portal navigation menu with dropdown menus, mobile responsiveness, and user profile functionality.

## Features

### 🎨 **Modern Design**
- Beautiful gradient background with smooth animations
- Responsive design that works on desktop, tablet, and mobile
- Smooth hover effects and transitions
- Professional typography using Salesforce Sans

### 📱 **Mobile-First Responsive**
- Hamburger menu for mobile devices
- Collapsible mobile navigation
- Touch-friendly interface
- Adaptive layout for different screen sizes

### 🧭 **Navigation Features**
- **Dashboard** - Main landing page
- **My Accounts** - Account management with submenu:
  - Account Overview
  - Account Details
  - Billing Information
- **Orders** - Order management with submenu:
  - Order History
  - Track Order
  - Returns & Refunds
- **Support** - Customer support with submenu:
  - Create Case
  - My Cases
  - Knowledge Base
  - Contact Us
- **Documents** - Document access

### 👤 **User Profile Section**
- User avatar display
- Dropdown menu with:
  - My Profile
  - Settings
  - Logout

### ♿ **Accessibility**
- Keyboard navigation support
- Focus states for all interactive elements
- High contrast mode support
- Screen reader friendly

## Usage

### In Lightning App Builder
1. Navigate to Setup → Lightning App Builder
2. Edit any Lightning page
3. Add the "Customer Portal Navigation" component
4. Configure the component properties:
   - **User Name**: Display name for the user profile
   - **User Avatar**: URL for the user avatar image

### In Communities
1. Navigate to Setup → Digital Experiences → All Sites
2. Edit your community
3. Go to Builder → Components
4. Add the "Customer Portal Navigation" component to your header

### In Aura Components
```html
<c:customerPortalNavigation 
    userName="John Doe"
    userAvatar="/path/to/avatar.jpg">
</c:customerPortalNavigation>
```

## Customization

### Styling
The component uses CSS custom properties for easy theming:
- `--sds-c-icon-color-foreground-default`: Icon colors
- Gradient background can be modified in the CSS
- Font family uses Salesforce Sans by default

### Menu Items
To modify the menu structure, edit the `initializeMenuItems()` method in the JavaScript file:

```javascript
{
    id: 'custom-menu',
    label: 'Custom Menu',
    icon: 'utility:custom',
    isActive: false,
    hasSubmenu: true,
    showSubmenu: false,
    submenuItems: [
        {
            id: 'sub-item',
            label: 'Sub Item',
            icon: 'utility:list',
            url: '/custom/path'
        }
    ]
}
```

### Navigation Logic
The component includes placeholder navigation logic. To implement real navigation:

1. Replace the `navigateToPage()` method with actual navigation logic
2. Use `NavigationMixin` for Lightning navigation
3. Implement proper logout functionality in `handleLogout()`

## Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies
- Lightning Web Components framework
- Salesforce Lightning Design System (SLDS)
- NavigationMixin (for navigation functionality)

## File Structure
```
customerPortalNavigation/
├── customerPortalNavigation.html    # Template
├── customerPortalNavigation.js      # Controller
├── customerPortalNavigation.css     # Styles
├── customerPortalNavigation.js-meta.xml  # Metadata
└── README.md                       # Documentation
```

## Version History
- **v1.0.0**: Initial release with full navigation functionality 