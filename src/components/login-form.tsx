import { cn } from "@/lib/utils"
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
import { DeviconGoogle } from "@/assets/svgIcons"
// Form validation
import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useEffect } from "react"
// UI
import { getCurrentTime, toastNotification } from "@/components/utils"
import { Link } from 'react-router-dom'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface LoginFormInputs {
  username: string;
  password: string;
}

async function submitFormData(data: object, url: string) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log("Form submitted successfully");
      return response.json();
    } else {
      toastNotification("Error submitting form", getCurrentTime())
      throw new Error(`Error submitting form: ${response.status}`);
    }
  } catch (error) {
    console.error('An error occurred:', error);
    toastNotification("An error occurred", getCurrentTime())
  }
}

const loginSchema = yup.object().shape({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Must have at least 3 characters"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
})
export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({ resolver: yupResolver(loginSchema) })

  const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    console.log("Form Submitted: ", data)
    // WARN: Backend URL
    const url = "http://localhost:8080/api/login"
    submitFormData(data, url).then((response) => {
      console.log(response);
      if (response.token) {
        localStorage.setItem("token", response.token)
        toastNotification("Logged in successfully", getCurrentTime())
      }
    }).catch((error) => {
      console.error(error);
    });
  }
  useEffect(() => {
    if (errors.username) toastNotification("Invalid Username", errors.username.message);
    if (errors.password) toastNotification("Invalid Password", errors.password.message);
  }, [errors])
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your details below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="username">Username*</Label>
                </div>
                <Input
                  id="username"
                  type="text"
                  {...register("username")}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password*</Label>
                  <div className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Link
                            to="#"
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                            Forgot your password?
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Password reset</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              {/* TODO: Google login */}
              <Button variant="outline" className="w-full">
                <DeviconGoogle /> Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Link to="/signup" className="hover:underline"> Sign up </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Signup</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
