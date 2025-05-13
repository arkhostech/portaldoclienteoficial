
// This script is meant to be run from the terminal to create the admin user
// It's not intended to be part of the application

const createAdminUser = async () => {
  try {
    const response = await fetch(
      'https://mdywdodbnmxavqleccwf.supabase.co/functions/v1/create-admin-user',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1keXdkb2Ribm14YXZxbGVjY3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzQ1NTIsImV4cCI6MjA1OTg1MDU1Mn0.G6GPlNrN_nHX-1GcfSohCA2c4aT8DeDyOiRfrzJoFv8'
        }
      }
    );
    
    const data = await response.json();
    console.log('Admin user creation response:', data);
    
  } catch (err) {
    console.error('Error creating admin user:', err);
  }
};

// Uncomment and run this function to create the admin user
// createAdminUser();

// Usage:
// 1. Open the browser console
// 2. Copy/paste this entire script
// 3. Call the createAdminUser() function
console.log('Admin user script loaded. Call createAdminUser() to create the admin user.');
