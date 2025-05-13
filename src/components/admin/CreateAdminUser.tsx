
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const CreateAdminUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminCreated, setAdminCreated] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const createAdminUser = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        'https://mdywdodbnmxavqleccwf.supabase.co/functions/v1/create-admin-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1keXdkb2Ribm14YXZxbGVjY3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzQ1NTIsImV4cCI6MjA1OTg1MDU1Mn0.G6GPlNrN_nHX-1GcfSohCA2c4aT8DeDyOiRfrzJoFv8'}`
          }
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin user');
      }
      
      setAdminCredentials({
        email: data.email,
        password: data.password
      });
      setAdminCreated(true);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the admin user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Admin User</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {adminCreated && adminCredentials ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Admin user created successfully!
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-md border">
              <h3 className="font-medium mb-2">Admin Credentials</h3>
              <p><strong>Email:</strong> {adminCredentials.email}</p>
              <p><strong>Password:</strong> {adminCredentials.password}</p>
              <p className="mt-2 text-sm text-gray-500">
                Please save these credentials securely. You will not be able to see the password again.
              </p>
            </div>
          </div>
        ) : (
          <Button
            onClick={createAdminUser}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Admin User...
              </>
            ) : (
              'Create New Admin User'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateAdminUser;
