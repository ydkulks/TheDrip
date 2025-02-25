import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
// Form validation
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect } from "react";
// UI
import { getCurrentTime, toastNotification } from "@/components/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormInputs {
  productName: string;
  productDescription: string;
  productColors: (string|undefined)[];
  productSizes: (string|undefined)[];
  categoryId: string;
  seriesId: string;
  productPrice: number;
  productStock: number;
}

async function productFormData(data: object, url: string) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log("Form submitted successfully");
      return response.json();
    } else {
      throw new Error(`Error submitting form: ${response.status}`);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// TODO: Get the ID and VALUE from DB dynamically
const categoryMap = {
  "Short Sleeve Tees": 1,
  "Long Sleeve Tees": 2,
  "Button Down Shirt": 3,
  Hoodies: 4,
  Cargos: 5,
  Shorts: 6,
  "Sweat Pants": 7,
  Tops: 8,
  Bottoms: 9,
  "Bomber Jackets": 10,
};
const seriesMap = {
  "Cyberpunk: Edgerunners": 1,
};
const productColors = [
  { color_id: 1, color_name: "original" },
  { color_id: 2, color_name: "white" },
  { color_id: 3, color_name: "black" },
];

const productSizes = [
  { size_id: 1, size_name: "small" },
  { size_id: 2, size_name: "medium" },
  { size_id: 3, size_name: "large" },
  { size_id: 4, size_name: "extra_large" },
];

const categoryKeys = Object.keys(categoryMap);
const seriesKeys = Object.keys(seriesMap);

const productSchema = yup.object().shape({
  productName: yup
    .string()
    .required("Product Name is required")
    .min(3, "Must have at least 3 characters"),
  productDescription: yup
    .string()
    .required("Product Description is required")
    .min(10, "Must have at least 10 characters")
    .max(500, "Must have at maximum 500 characters"),
  productColors: yup
    .array()
    .of(yup.string())
    .required("You must select at least one color")
    .min(1, "You must select at least one color"),
  productSizes: yup
    .array()
    .of(yup.string())
    .required("You must select at least one size")
    .min(1, "You must select at least one size"),
  categoryId: yup
    .string()
    .oneOf(categoryKeys, "Invalid category selected")
    .required("Category Id is required"),
  seriesId: yup
    .string()
    .oneOf(seriesKeys, "Invalid series selected")
    .required("Series Id is required"),
  productPrice: yup
    .number()
    .required("Price is required")
    .positive("Price must be positive")
    .typeError("Price must be a number"),
  productStock: yup
    .number()
    .required("Stock is required")
    .integer("Stock must be an integer")
    .min(0, "Stock cannot be negative"),
});

const ProductForm = () => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormInputs>({
    resolver: yupResolver(productSchema),
    defaultValues: { productColors: ["original"], productSizes: ["small"] },
  });

  const onSubmit: SubmitHandler<ProductFormInputs> = (data) => {
    // WARN: Backend URL
    const url = "http://localhost:8080/seller/product";
    console.log(data);
    // TODO: Append additional fields into data
    // Like, user_id
    productFormData(data, url)
      .then((response) => {
        console.log(response);
        toastNotification("Product has been created", getCurrentTime());
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    if (errors.productName) toastNotification("Invalid Product Name", errors.productName.message);
    if (errors.productDescription) toastNotification("Invalid Description", errors.productDescription.message);
    if (errors.productColors) toastNotification("Invalid Color", errors.productColors.message);
    if (errors.productSizes) toastNotification("Invalid Size", errors.productSizes.message);
    if (errors.categoryId) toastNotification("Invalid Category", errors.categoryId.message);
    if (errors.seriesId) toastNotification("Invalid Series", errors.seriesId.message);
    if (errors.productPrice) toastNotification("Invalid Price", errors.productPrice.message);
    if (errors.productStock) toastNotification("Invalid Stock", errors.productStock.message);
  }, [errors]);

  const handleColorChange = (colorName: string, checked: string | boolean) => {
    const currentColors = watch("productColors")?.filter(Boolean) as string[] || [];

    const isChecked = typeof checked === 'boolean' ? checked : checked === 'true';

    const newColors = isChecked
      ? [...currentColors, colorName]
      : currentColors.filter((color) => color !== colorName);

    setValue("productColors", newColors);
  };
  const handleSizeChange = (sizeName: string, checked: string | boolean) => {
    const currentSizes = watch("productSizes")?.filter(Boolean) as string[] || [];

    // Type guard to ensure checked is a boolean
    const isChecked = typeof checked === 'boolean' ? checked : checked === 'true';

    const newSizes = isChecked
      ? [...currentSizes, sizeName]
      : currentSizes.filter((size) => size !== sizeName);

    setValue("productSizes", newSizes);
  };
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Product</CardTitle>
            <CardDescription>
              Enter product details for creating your new product.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="productName">Product Name*</Label>
                  <Input
                    id="productName"
                    type="text"
                    {...register("productName")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="productDescription">
                    Product Description*
                  </Label>
                  <Textarea
                    id="productDescription"
                    placeholder="Product description..."
                    {...register("productDescription")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="productSizes">Sizes*</Label>
                  <div className="flex items-center space-x-2">
                    {productSizes.map((size) => (
                      <div key={size.size_name} className="flex items-center space-x-2">
                        <Checkbox
                          id={size.size_name}
                          checked={watch("productSizes")?.includes(size.size_name)}
                          onCheckedChange={(checked) =>
                            handleSizeChange(size.size_name, checked)
                          }
                        />
                        <Label htmlFor={size.size_name}>{size.size_name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="productColors">Colors*</Label>
                  <div className="flex items-center space-x-2">
                    {productColors.map((color) => (
                      <div key={color.color_name} className="flex items-center space-x-2">
                        <Checkbox
                          id={color.color_name}
                          checked={watch("productColors")?.includes(color.color_name)}
                          onCheckedChange={(checked) =>
                            handleColorChange(color.color_name, checked)
                          }
                        />
                        <Label htmlFor={color.color_name}>{color.color_name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="categoryId">Category*</Label>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue>
                            {field.value || "Select category"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Short Sleeve Tees">
                            Short Sleeve Tees
                          </SelectItem>
                          <SelectItem value="Long Sleeve Tees">
                            Long Sleeve Tees
                          </SelectItem>
                          <SelectItem value="Button Down Shirt">
                            Button Down Shirt
                          </SelectItem>
                          <SelectItem value="Hoodies">Hoodies</SelectItem>
                          <SelectItem value="Cargos">Cargos</SelectItem>
                          <SelectItem value="Shorts">Shorts</SelectItem>
                          <SelectItem value="Sweat Pants">Sweat Pants</SelectItem>
                          <SelectItem value="Tops">Tops</SelectItem>
                          <SelectItem value="Bottoms">Buttoms</SelectItem>
                          <SelectItem value="Bomber Jackets">
                            Bomber Jackets
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="seriesId">Series*</Label>
                  <Controller
                    name="seriesId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue> {field.value || "Select series"} </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cyberpunk: Edgerunners">
                            Cyberpunk: Edgerunners
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="productPrice">Price*</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    step="0.01"
                    {...register("productPrice", { valueAsNumber: true })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="productStock">Stock*</Label>
                  <Input
                    id="productStock"
                    type="number"
                    {...register("productStock", { valueAsNumber: true })}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="w-full"> Submit </Button>
                  <Button type="reset" className="w-full"> Reset </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Profile = () => {
  return (
    <>
      <ProductForm />
    </>
  );
};

export default Profile;
