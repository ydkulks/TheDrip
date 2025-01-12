// UI
import { getCurrentTime, toastNotification } from "@/components/utils"
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

interface SignupFormInputs {
  email: string;
  username: string;
  password: string;
  confirmpassword: string;
}

const signupSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email address"),
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Must have at least 3 characters"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmpassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Password is required"),
})

const SignupForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>({ resolver: yupResolver(signupSchema) })

  const onSubmit: SubmitHandler<SignupFormInputs> = (data) => {
    // TODO: Signup form submition to backend
    console.log("Form Submitted: ", data)
    toastNotification("Account has been created", getCurrentTime())
  }
  useEffect(() => {
    if (errors.email) toastNotification("Invalid Email", errors.email.message);
    if (errors.username) toastNotification("Invalid Username", errors.username.message);
    if (errors.password) toastNotification("Invalid Password", errors.password.message);
    if (errors.confirmpassword) toastNotification("Invalid Confirm Password", errors.confirmpassword.message);
  }, [errors])
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="mail@example.com"
                    required
                  />
                </div>
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
                  </div>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="confirmpassword">Confirm Password*</Label>
                  </div>
                  <Input
                    id="confirmpassword"
                    type="password"
                    {...register("confirmpassword")}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Create account
                </Button>
                {/* TODO: Google Signup */}
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
      <SignupForm />
    </>
  )
}

export default Signup
