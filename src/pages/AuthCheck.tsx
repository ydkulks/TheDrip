import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import { toastNotification, useTokenDetails } from "@/components/utils";
import { Role } from "@/components/types";

interface AuthCheckProps {
  children: React.ReactNode;
  allowedRoles: Role[]; // Add allowedRoles prop
}

function AuthCheck({ children, allowedRoles }: AuthCheckProps) {
  const navigate = useNavigate();
  const { token, decodedToken } = useTokenDetails();

  useEffect(() => {
    const isLoggedIn = () => {
      if (!token) {
        // If no token exists, redirect to login
        toastNotification("Not logged in", "User is not logged into their account!")
        navigate("/login");
        return null; // Important: Prevent further rendering
      }

      // Check if the user's role is allowed
      const userRole = decodedToken.role;

      if (userRole) {
        if (!allowedRoles.includes(userRole as Role)) {
          toastNotification(
            "Unauthorized",
            "You do not have permission to access this page."
          );
          navigate("/"); // Or a generic "unauthorized" page
          return null; // Prevent further rendering
        }
      } else {
        // Handle case where userRole is null or undefined
        toastNotification(
          "Error",
          "Could not determine your role. Please log in again."
        );
        navigate("/login");
        return null;
      }

      const expiryDate = decodedToken.exp;

      if (token && expiryDate && expiryDate * 1000 < Date.now()) {
        // If the token exists BUT is expired, redirect to login
        toastNotification("Session Expired", "Login to you're account")
        navigate("/login");
        return null; // Important: Prevent further rendering
      }
    }
    isLoggedIn()
  }, [])

  // If the token exists and is not expired, render the children
  return <>{children}</>;
}

export default AuthCheck;
