
import { useNavigate, useLocation } from "react-router-dom";

// Determine if the current path is in the admin section
export const isAdminPath = (path: string): boolean => {
  return path === '/admin-login' || path.startsWith('/admin');
};

// Determine if the current path is in the client section
export const isClientPath = (path: string): boolean => {
  return path === '/' || path === '/dashboard' || 
         path === '/documents' || path === '/payments' || 
         path === '/knowledge' || path === '/messages';
};
