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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// Form validation
import { SubmitHandler, useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useEffect } from "react"
import { NavigateFunction, useNavigate } from 'react-router-dom'

interface SignupFormInputs {
  role: string;
  email: string;
  username: string;
  // password: string;
  // confirmpassword: string;
}

const roles = ['Customer', 'Seller', 'Admin']
const signupSchema = yup.object().shape({
  role: yup
    .string()
    .oneOf(roles, 'Invalid role selected')
    .required("Role is required"),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email address"),
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Must have at least 3 characters"),
  // password: yup
  //   .string()
  //   .required("Password is required")
  //   .min(8, "Password must be at least 8 characters"),
  // confirmpassword: yup
  //   .string()
  //   .oneOf([yup.ref("password")], "Passwords must match")
  //   .required("Password is required"),
})

async function submitFormData(data: object, url: string, navigate: NavigateFunction) {
  try {
    // Send a POST request to the API endpoint with form data
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    // Check if the response was successful
    if (response.ok) {
      // console.log("Form submitted successfully");
      // return response.json();
      toastNotification("Account has been created", getCurrentTime())
      navigate("/profile/user_management")
    } else {
      throw new Error(`Error submitting form: ${response.status}`);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

const SignupForm = () => {
  const navigate = useNavigate();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>({ resolver: yupResolver(signupSchema) })

  const onSubmit: SubmitHandler<SignupFormInputs> = (data) => {
    console.log("Form Submitted: ", data)
    // WARN: Backend URL
    const url = "http://localhost:8080/admin/user"
    submitFormData(data, url, navigate).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });
  }
  useEffect(() => {
    if (errors.role) toastNotification("Invalid Role", errors.role.message);
    if (errors.email) toastNotification("Invalid Email", errors.email.message);
    if (errors.username) toastNotification("Invalid Username", errors.username.message);
  }, [errors])
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your details below to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="role">Role*</Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue> {field.value || "Select role"} </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Customer">Customer</SelectItem>
                          <SelectItem value="Seller">Seller</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
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
                    <Label htmlFor="password">Auto Generated Temp. Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    disabled={true}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Create account
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const CreateUser = () => {
  return (
    <div>
      <SignupForm />
    </div>
  )
}
