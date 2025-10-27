# Enhanced Toast System

The MediVision admin dashboard now features an enhanced toast notification system with distinct visual styling for different types of messages to improve user experience and understanding.

## Toast Types

### Success Toasts (Green)
- Used for successful operations and confirmations
- Green color scheme with checkmark icon
- Background: green-50 with green-800 text in light mode, green-950 with green-200 text in dark mode

### Error Toasts (Red)
- Used for errors, failures, and critical issues
- Red color scheme with error icon
- Uses the existing "destructive" variant styling

### Warning Toasts (Yellow)
- Used for warnings and cautionary messages
- Yellow color scheme with warning icon
- Background: yellow-50 with yellow-800 text in light mode, yellow-950 with yellow-200 text in dark mode

### Info Toasts (Blue)
- Used for informational messages and general notifications
- Blue color scheme with information icon
- Background: blue-50 with blue-800 text in light mode, blue-950 with blue-200 text in dark mode

## Features

- Distinct color coding for quick identification
- Appropriate icons for each message type
- Responsive design that works on all screen sizes
- Dark mode support with appropriate color adjustments
- Automatic positioning in the top-right corner
- Dismissible with close button

## Usage

```typescript
const { toast } = useToast();

// Success toast
toast({
  title: 'Profile Updated',
  description: 'Your profile has been updated successfully!',
  variant: 'success',
});

// Error toast
toast({
  title: 'Update Failed',
  description: 'Failed to update profile',
  variant: 'destructive',
});

// Warning toast
toast({
  title: 'File Too Large',
  description: 'File size must be less than 5MB',
  variant: 'warning',
});

// Info toast
toast({
  title: 'Information',
  description: 'Here is some important information',
  variant: 'info',
});
```