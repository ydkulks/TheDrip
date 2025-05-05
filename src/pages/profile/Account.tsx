import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toastNotification, useTokenDetails } from "@/components/utils"
import { Calendar, Fingerprint, IdCard, Lock, LogOut, Mail, Trash, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

interface userDataType {
  id: number,
  email: string,
  username: string,
  role: string,
  created: string,
  updated: string,
}

export default function AccountPage() {
  const [isPwdSubmitting, setIsPwdSubmitting] = useState(false);
  // Get user data
  // Format dates to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }
  const [userData, setUserData] = useState<userDataType | null>(null);
  const [open, setOpen] = useState(false);
  const { token, decodedToken } = useTokenDetails();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/${decodedToken.id}`, {
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          return response.json() as Promise<userDataType>;
        } else {
          return null;
          // throw new Error(`Error submitting form: ${response.status}`);
        }
      } catch (error) {
        console.error("An error occurred:", error);
        toastNotification("Could not get user data", "An error occurred")
        return null;
      }
    }
    getUserData()
      .then(res => {
        setUserData(res)
      })
  }, [isPwdSubmitting])

  // Logout
  const [openLogout, setOpenLogout] = useState(false);
  const navigate = useNavigate()

  const handleLogout = () => {
    setOpenLogout(true);
  }
  const confirmLogout = async () => {
    setOpenLogout(false); // Close pop-up

    // 1. Clear the JWT from client-side storage
    localStorage.removeItem("token"); // Or sessionStorage, cookie, etc.

    // 2. Optionally notify the backend
    // try {
    //   const response = await fetch("/api/logout", {
    //     method: "POST", // Or DELETE, depending on your API
    //     headers: {
    //       "Content-Type": "application/json"
    //       // Include any necessary authorization headers if required
    //     }
    //   });

    //   if (!response.ok) {
    //     console.error("Logout failed on the server:", response.status);
    //     // Handle server-side logout failure (e.g., display an error message)
    //   }
    // } catch (error) {
    //   console.error("Error during logout:", error);
    //   // Handle network errors or other issues
    // }

    // 3. Redirect to the login page
    navigate("/login");
  };

  // Password Reset
  const [newPassword, setNewPassword] = useState("");
  const handlePasswordChange = (event:any) => {
    setNewPassword(event.target.value);
  };

  const handleResetPassword = async () => {
    setIsPwdSubmitting(true);

    try {
      const username = decodedToken.sub;

      // Basic client-side validation (can be improved)
      if (newPassword.length < 8) {
        toastNotification(
          "Validation Error",
          "Password must be at least 8 characters.",
        );
        setIsPwdSubmitting(false); //Re-enable the button
        return; // Stop the submission
      }

      const response = await fetch(`http://localhost:8080/api/reset-password?username=${username}&newPassword=${newPassword}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Assuming token is stored in localStorage
        },
        // body: JSON.stringify({
        //   username: username,
        //   newPassword: newPassword,
        // }),
      });

      if (response.ok) {
        toastNotification(
          "Password reset successful!",
          "Your password has been reset.",
        );
        setNewPassword(""); // Clear the input after success
      } else {
        toastNotification(
          "Password reset failed.",
          "Something went wrong.",
        );
      }
    } catch (error) {
      toastNotification(
        "An error occurred.",
        "Failed to reset password.",
      );
    } finally {
      setIsPwdSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center m-2">
      <div className="container max-w-4xl py-2">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Account Details</h1>
          <p className="text-muted-foreground">View your account information.</p>
        </div>

        <div className="grid gap-2 md:grid-cols-[1fr_2fr]">
          {/* Profile Card */}
          <Card className="h-fit">
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src="https://github.com/shadcn.png" alt={userData?.username} />
                <AvatarFallback className="text-2xl">{userData?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{userData?.username}</CardTitle>
              <CardDescription>{userData?.email}</CardDescription>
              <Badge className="mt-2" variant="secondary">
                {userData?.role}
              </Badge>
            </CardHeader>
          </Card>

          {/* Account Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground inline-flex gap-2">
                  <Fingerprint size="16" />User ID
                </h3>
                <p className="font-medium">{userData?.id}</p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground inline-flex gap-2">
                  <User size="16" />Username
                </h3>
                <p className="font-medium">{userData?.username}</p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground inline-flex gap-2">
                  <Mail size="16" />Email
                </h3>
                <p className="font-medium">{userData?.email}</p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground inline-flex gap-2">
                  <IdCard size="16" />Role
                </h3>
                <p className="font-medium">{userData?.role}</p>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground inline-flex gap-2">
                    <Calendar size="16" />Created
                  </h3>
                  <p className="font-medium">{userData ? formatDate(userData.created) : ""}</p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground inline-flex gap-2">
                    <Calendar size="16" />Last Updated
                  </h3>
                  <p className="font-medium">{userData ? formatDate(userData.updated) : ""}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <span></span>
          <Card >
            <CardHeader>
              <CardTitle>Logout</CardTitle>
              <CardDescription>Logout from your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleLogout}><LogOut />Logout</Button>
            </CardContent>
          </Card>

          {/* Password Reset */}
          <span></span>
          <Card id="password_reset">
            <CardHeader>
              <CardTitle>Password Reset</CardTitle>
              <CardDescription>Change you're password</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="New password"
                className="mb-2"
                value={newPassword}
                onChange={handlePasswordChange}
              />
              <Button variant="outline" disabled={isPwdSubmitting} onClick={handleResetPassword}>
                <Lock />
                {isPwdSubmitting ? "Resetting..." : "Reset password"}
              </Button>
            </CardContent>
          </Card>

          {/* Delete account */}
          <span></span>
          <Card id="delete_account">
            <CardHeader>
              <CardTitle>Delete account</CardTitle>
              <CardDescription>Permanently delete you're account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive"><Trash />Delete account</Button>
            </CardContent>
          </Card>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will log you out of the application.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                {/* TODO: Handle account deletioin */}
                <AlertDialogAction onClick={() => { }}>Log Out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog open={openLogout} onOpenChange={setOpenLogout}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will log you out of the application.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmLogout}>Log Out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
