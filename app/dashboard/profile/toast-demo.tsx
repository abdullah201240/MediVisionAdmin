'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function ToastDemo() {
  const { toast } = useToast();

  return (
    <Card className="rounded-2xl border-none shadow-none bg-white">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-2xl font-bold">Toast Demo</CardTitle>
        <p className="text-muted-foreground">Click the buttons below to see different toast variants</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => {
              toast({
                title: 'Success Toast',
                description: 'This is a success message with a green background',
                variant: 'success',
              });
            }}
            className="bg-green-500 hover:bg-green-600"
          >
            Success Toast
          </Button>
          
          <Button
            onClick={() => {
              toast({
                title: 'Error Toast',
                description: 'This is an error message with a red background',
                variant: 'destructive',
              });
            }}
            variant="destructive"
          >
            Error Toast
          </Button>
          
          <Button
            onClick={() => {
              toast({
                title: 'Warning Toast',
                description: 'This is a warning message with a yellow background',
                variant: 'warning',
              });
            }}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            Warning Toast
          </Button>
          
          <Button
            onClick={() => {
              toast({
                title: 'Info Toast',
                description: 'This is an info message with a blue background',
                variant: 'info',
              });
            }}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Info Toast
          </Button>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-muted-foreground">
            These colorful toasts help users quickly identify the type of message they're seeing.
            Success messages are green, errors are red, warnings are yellow, and informational messages are blue.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}