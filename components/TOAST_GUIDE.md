# Enhanced Toast System Guide

The MediVision admin dashboard now features an enhanced toast notification system with distinct visual styling for different types of messages. This guide explains how to use the new toast variants throughout the application.

## Toast Variants

### Success Toasts (Green)
- **Purpose**: Used for successful operations and confirmations
- **Color Scheme**: Green background with dark green text
- **Icon**: Checkmark icon
- **Usage**: When an operation completes successfully

```typescript
toast({
  title: 'Operation Successful',
  description: 'Your action was completed successfully.',
  variant: 'success',
});
```

### Error Toasts (Red)
- **Purpose**: Used for errors, failures, and critical issues
- **Color Scheme**: Red background with dark red text
- **Icon**: Error/cross icon
- **Usage**: When an operation fails or encounters an error

```typescript
toast({
  title: 'Operation Failed',
  description: 'Failed to complete the operation. Please try again.',
  variant: 'destructive',
});
```

### Warning Toasts (Yellow)
- **Purpose**: Used for warnings and cautionary messages
- **Color Scheme**: Yellow background with dark yellow text
- **Icon**: Warning triangle icon
- **Usage**: When the user needs to be cautious about something

```typescript
toast({
  title: 'Warning',
  description: 'This action requires your attention.',
  variant: 'warning',
});
```

### Info Toasts (Blue)
- **Purpose**: Used for informational messages and general notifications
- **Color Scheme**: Blue background with dark blue text
- **Icon**: Information circle icon
- **Usage**: For general information or neutral notifications

```typescript
toast({
  title: 'Information',
  description: 'Here is some important information.',
  variant: 'info',
});
```

## Implementation Details

The toast system is implemented using the `useToast` hook and the `Toaster` component. The `Toaster` component is already included in the root layout (`app/layout.tsx`), so the toast system is available throughout the entire application.

### Using Toasts in Components

1. Import the `useToast` hook:
```typescript
import { useToast } from '@/hooks/use-toast';
```

2. Use the hook in your component:
```typescript
const { toast } = useToast();
```

3. Call the toast function with appropriate parameters:
```typescript
toast({
  title: 'Toast Title',
  description: 'Toast description message.',
  variant: 'success', // 'success' | 'destructive' | 'warning' | 'info'
});
```

## Best Practices

1. **Use descriptive titles**: Make the toast title clear and concise
2. **Provide helpful descriptions**: Explain what happened or what the user should do next
3. **Choose the right variant**: Match the variant to the type of message
4. **Be consistent**: Use the same terminology and styling throughout the application
5. **Keep it brief**: Toasts should be concise and to the point

## Examples

### Successful Form Submission
```typescript
try {
  await submitForm(data);
  toast({
    title: 'Form Submitted',
    description: 'Your form has been successfully submitted.',
    variant: 'success',
  });
} catch (error) {
  toast({
    title: 'Submission Failed',
    description: 'Failed to submit the form. Please try again.',
    variant: 'destructive',
  });
}
```

### File Upload Warning
```typescript
if (file.size > MAX_FILE_SIZE) {
  toast({
    title: 'File Too Large',
    description: `File size must be less than ${MAX_FILE_SIZE_MB}MB.`,
    variant: 'warning',
  });
  return;
}
```

### Informational Message
```typescript
toast({
  title: 'New Feature Available',
  description: 'Check out the new dashboard features in the settings menu.',
  variant: 'info',
});
```

## Customization

The toast system can be further customized by modifying the following files:
- `components/ui/toast.tsx` - Core toast component styling
- `components/ui/toaster.tsx` - Toast container and display logic
- `hooks/use-toast.ts` - Toast state management

## Accessibility

The toast system includes:
- Proper contrast ratios for readability
- Clear visual indicators for each message type
- Screen reader support
- Keyboard navigable elements

This ensures that all users can effectively understand and interact with toast notifications.