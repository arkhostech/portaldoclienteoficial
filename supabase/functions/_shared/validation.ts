
// Input validation utilities

// Function to sanitize input data
export function sanitizeInput(input: string): string {
  // Basic sanitization - remove potentially harmful characters
  return input.replace(/[<>"'&]/g, '');
}

// Function to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to validate password strength
export function isValidPassword(password: string): boolean {
  // At least 6 characters (minimum requirement)
  return password.length >= 6;
}

// Function to validate client form data
export function validateClientFormData(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  // Validate required fields
  if (!data.full_name) errors.push("Full name is required");
  if (!data.email) errors.push("Email is required");
  if (!data.password) errors.push("Password is required");
  
  // Validate format if fields are provided
  if (data.email && !isValidEmail(data.email)) errors.push("Invalid email format");
  if (data.password && !isValidPassword(data.password)) errors.push("Password must be at least 6 characters");
  
  return { 
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}
