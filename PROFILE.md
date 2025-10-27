# Admin Profile Management

## Overview
This document explains how to use the admin profile management feature in the MediVision admin panel.

## Accessing the Profile Page
1. Log in to the admin panel
2. Click on your profile icon in the sidebar
3. Select "Profile" from the dropdown menu
4. Or navigate directly to `/profile`

## Profile Information
The profile page displays the following information:
- Full Name
- Email Address (read-only)
- Phone Number
- Gender
- Date of Birth
- Role (read-only)

## Updating Profile Information
1. Navigate to the Profile page
2. Modify the fields you wish to update:
   - Full Name
   - Phone Number
   - Gender
   - Date of Birth
3. Click "Save Changes"
4. You will see a success message when the update is complete

## Security Notes
- Email addresses cannot be changed through the profile page for security reasons
- Roles are assigned by system administrators and cannot be modified by users
- Password changes are not currently supported through the profile page

## Technical Implementation
The profile feature uses the following endpoints:
- `GET /users/profile` - Retrieve current user profile
- `PUT /users/profile` - Update current user profile

The frontend uses the `authApi.updateProfile()` method from the API library to communicate with the backend.