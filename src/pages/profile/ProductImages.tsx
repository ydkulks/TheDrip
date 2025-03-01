import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
{/*
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

interface ImageUploadInputs {
  productId: number;
  file: FileList;
}

async function submitFormData(data: FileList,url: string) {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      console.log("Form submitted successfully");
      return response.json();
    } else {
      throw new Error(`Error submitting form: ${response.status}`);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

const imageSchema = yup.object().shape({
  productId: yup
    .number()
    .required("Product ID is required.")
    .positive("ID shuld be positive."),
  file: yup
    .array().of(FileList)
    .required("Files must be uploaded.")
    .min(2, "Must have at least 2 images"),
})
export function ImageUploadForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ImageUploadInputs>({ resolver: yupResolver(imageSchema) })

  const onSubmit: SubmitHandler<ImageUploadInputs> = (data) => {
    console.log("Form Submitted: ", data)
    // WARN: Backend URL
    const url = `http://localhost:8080/seller/${username}/${productId}/image`
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
  */}
function ProductImages() {
  const handleSubmit = () => { };
  return (
    <>
      <h1 className="font-integralcf font-extrabold text-2xl text-center">Upload images</h1>
      <form onSubmit={handleSubmit}>
        <Label htmlFor="productId">Product ID</Label>
        <Input id="productId" type="number" required />
        <Input type="file" required />
        <Button type="submit">Submit</Button>
        <Button type="reset">Reset</Button>
      </form>
    </>
  );
}
export default ProductImages;
