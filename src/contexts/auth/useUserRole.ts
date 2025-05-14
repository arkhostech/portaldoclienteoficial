
import { useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { checkUserRoleWithCache } from "@/integrations/supabase/client";

export function useUserRole() {
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Memoized function to check user role - avoids unnecessary database queries
  const checkUserRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const userRole = await checkUserRoleWithCache(userId);
      console.log("User role check result:", userRole);
      return userRole === 'admin';
    } catch (error) {
      console.error("Error checking user role:", error);
      return false;
    }
  }, []);

  const updateUserRole = async (user: User | null) => {
    if (!user) {
      console.log("No user provided to updateUserRole");
      setIsAdmin(false);
      return false;
    }
    
    try {
      console.log("Checking admin status for user:", user.id);
      const isUserAdmin = await checkUserRole(user.id);
      console.log("Admin check result:", isUserAdmin);
      setIsAdmin(isUserAdmin);
      return isUserAdmin;
    } catch (error) {
      console.error("Error in admin check:", error);
      setIsAdmin(false);
      return false;
    }
  };

  return {
    isAdmin,
    checkUserRole,
    updateUserRole
  };
}
