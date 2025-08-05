# Configurable Navigation LWC

A configurable Lightning Web Component that mimics the Aussie Elevate navigation design with customizable menu items, colors, and URLs.

## Features

- **Configurable Logo**: Customizable icon and text for the brand section
- **Dynamic Menu Items**: Configurable navigation menu with support for submenus
- **Color Theming**: Customizable primary, secondary, and text colors
- **User Profile Menu**: Configurable user dropdown with settings and logout options
- **Notifications**: Optional notifications icon and dropdown
- **Responsive Design**: Mobile-friendly with responsive breakpoints
- **Accessibility**: Proper focus states and keyboard navigation support

## Default Menu Structure

The component comes with a default menu structure that matches the requirements:

- **Home**
- **Applications**
- **Portfolio**
- **Service Request**
  - My Service Request
  - New Request
  - Lodge Feedback
- **Knowledge Portal**

## Configuration Properties

### Basic Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `logoIcon` | String | `utility:home` | Salesforce Lightning Design System icon name for the logo |
| `logoText` | String | `Aussie` | Main logo text |
| `logoSubText` | String | `Elevate` | Secondary logo text |
| `primaryColor` | String | `#4A4A8C` | Primary color for the navigation (hex) |
| `secondaryColor` | String | `#FFD700` | Secondary color for the navigation (hex) |
| `textColor` | String | `#4A4A8C` | Text color for the navigation (hex) |
| `userName` | String | `User170486240...` | Display name for the user |
| `userAvatar` | String | `""` | URL for user avatar image |
| `showNotifications` | Boolean | `false` | Show notifications icon |

### Advanced Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `menuItems` | String | `""` | JSON string of menu items configuration |
| `userMenuItems` | String | `""` | JSON string of user menu items configuration |

## Menu Items Configuration

The `menuItems` property accepts a JSON string with the following structure:

```json
[
  {
    "id": "home",
    "label": "Home",
    "url": "/home",
    "hasSubmenu": false,
    "submenuItems": []
  },
  {
    "id": "serviceRequest",
    "label": "Service Request",
    "url": "/service-request",
    "hasSubmenu": true,
    "submenuItems": [
      {
        "id": "myServiceRequest",
        "label": "My Service Request",
        "url": "/service-request/my-requests"
      },
      {
        "id": "newRequest",
        "label": "New Request",
        "url": "/service-request/new"
      },
      {
        "id": "lodgeFeedback",
        "label": "Lodge Feedback",
        "url": "/service-request/feedback"
      }
    ]
  }
]
```

## User Menu Items Configuration

The `userMenuItems` property accepts a JSON string with the following structure:

```json
[
  {
    "id": "mySettings",
    "label": "My Settings",
    "icon": "utility:settings",
    "url": "/settings"
  },
  {
    "id": "logout",
    "label": "Logout",
    "icon": "utility:logout",
    "url": "/logout"
  }
]
```

## Usage Examples

### Basic Usage

```html
<c-configurable-navigation></c-configurable-navigation>
```

### Customized Branding

```html
<c-configurable-navigation
    logo-icon="utility:building"
    logo-text="My Company"
    logo-sub-text="Portal"
    primary-color="#2E7D32"
    secondary-color="#FFC107"
    text-color="#2E7D32">
</c-configurable-navigation>
```

### Custom Menu Items

```html
<c-configurable-navigation
    menu-items='[
      {
        "id": "dashboard",
        "label": "Dashboard",
        "url": "/dashboard",
        "hasSubmenu": false,
        "submenuItems": []
      },
      {
        "id": "reports",
        "label": "Reports",
        "url": "/reports",
        "hasSubmenu": true,
        "submenuItems": [
          {
            "id": "salesReport",
            "label": "Sales Report",
            "url": "/reports/sales"
          },
          {
            "id": "inventoryReport",
            "label": "Inventory Report",
            "url": "/reports/inventory"
          }
        ]
      }
    ]'>
</c-configurable-navigation>
```

### Custom User Menu

```html
<c-configurable-navigation
    user-menu-items='[
      {
        "id": "profile",
        "label": "My Profile",
        "icon": "standard:user",
        "url": "/profile"
      },
      {
        "id": "settings",
        "label": "Settings",
        "icon": "utility:settings",
        "url": "/settings"
      },
      {
        "id": "logout",
        "label": "Logout",
        "icon": "utility:logout",
        "url": "/logout"
      }
    ]'>
</c-configurable-navigation>
```

## Styling

The component uses CSS custom properties for dynamic theming:

- `--primary-color`: Primary color for the navigation
- `--secondary-color`: Secondary color (used for logo icon)
- `--text-color`: Text color for menu items and labels

## Responsive Behavior

- **Desktop**: Full navigation menu with hover effects
- **Tablet**: Reduced spacing, hidden user name
- **Mobile**: Hidden navigation menu, notifications, and user name

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility Features

- Proper focus states for keyboard navigation
- ARIA labels and roles
- High contrast mode support
- Screen reader compatible

## Dependencies

- Lightning Web Components framework
- Salesforce Lightning Design System
- NavigationMixin for page navigation

## Installation

1. Deploy the component to your Salesforce org
2. Add the component to your Lightning pages via the Lightning App Builder
3. Configure the properties as needed

## Customization

The component is designed to be easily customizable through the provided properties. For advanced customization, you can modify the CSS variables or extend the component's functionality. 