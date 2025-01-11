import { toast } from "sonner"
import { getCurrentTime } from "@/components/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { DeviconGoogle } from "@/assets/svgIcons"

const SignupForm = () => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your email below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="mail@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="username">Username*</Label>
                  </div>
                  <Input id="username" type="text" required />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password*</Label>
                  </div>
                  <Input id="password" type="password" required />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="confirmpassword">Confirm Password*</Label>
                  </div>
                  <Input id="confirmpassword" type="password" required />
                </div>
                <Button type="submit" className="w-full"
                  onClick={() =>
                    toast("Account has been created", {
                      description: getCurrentTime(),
                      action: {
                        label: <X className="text-gray-500 hover:text-black" />,
                        onClick: () => console.log(),
                      },
                    })
                  }
                >
                  Create account
                </Button>
                <Button variant="outline" className="w-full">
                  <DeviconGoogle /> Google
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Login
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const Signup = () => {
  return (
    <>
      {/* TODO: Form validation
        - Username: max characters
        - Password: special characters, numbers, min and max characters
        - Confirm Password: match with Password
        - Error: Add toast notification for errors
    */}
      <SignupForm />
    </>
  )
}

export default Signup
