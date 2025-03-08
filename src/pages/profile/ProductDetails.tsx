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
// import { jwtDecode } from "jwt-decode";
// Form validation
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useState } from "react";
// UI
import { getCurrentTime, toastNotification, tokenDetails } from "@/components/utils";
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
  productColors: (string | number)[];
  productSizes: (string | number)[];
  categoryId: string;
  seriesId: string;
  productPrice: number;
  productStock: number;
  userId: number;
}

// Get token from JWT
const token = localStorage.getItem("token");

async function productFormData(data: object, url: string) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log("Form submitted successfully");
      toastNotification("Product has been created", getCurrentTime());
      return response.json();
    } else {
      throw new Error(`Error submitting form: ${response.status}`);
    }
  } catch (error) {
    console.error("An error occurred:", error);
    toastNotification("An error occurred", getCurrentTime());
  }
}

// Get the ID and VALUE from DB dynamically
interface Category {
  categoryId: number;
  categoryName: string;
}

interface Series {
  series_id: number;
  series_name: string;
}

interface Size {
  size_id: number;
  size_name: string;
}

interface Color {
  color_id: number;
  color_name: string;
}

interface JsonData {
  categories: Category[];
  series: Series[];
  sizes: Size[];
  colors: Color[];
}

interface CategoryMap {
  [key: string]: number; // Key is the formatted category name, value is the ID
}

interface SeriesMap {
  [key: string]: number; // Key is the series name, value is the ID
}

interface ProductColor {
  color_id: number;
  color_name: string;
}

interface ProductSize {
  size_id: number;
  size_name: string;
}

// Default value
var jsonData: JsonData = {
  "categories": [{ "categoryId": 1, "categoryName": "short_sleeve_tees" }, { "categoryId": 2, "categoryName": "long_sleeve_tees" }, { "categoryId": 3, "categoryName": "button_down_shirt" }, { "categoryId": 4, "categoryName": "hoodies" }, { "categoryId": 5, "categoryName": "cargos" }, { "categoryId": 6, "categoryName": "shorts" }, { "categoryId": 7, "categoryName": "sweat_pants" }, { "categoryId": 8, "categoryName": "tops" }, { "categoryId": 9, "categoryName": "bottoms" }, { "categoryId": 10, "categoryName": "bomber_jackets" }],
  "series": [{ "series_id": 1, "series_name": "Cyberpunk: Edgerunners" },{ "series_id": 2, "series_name": "Dragon Ball Super: Super Hero" }],
  "sizes": [{ "size_id": 1, "size_name": "small" }, { "size_id": 2, "size_name": "medium" }, { "size_id": 3, "size_name": "large" }, { "size_id": 4, "size_name": "extra_large" }, { "size_id": 5, "size_name": "double_extra_large" }],
  "colors": [{ "color_id": 1, "color_name": "original" }, { "color_id": 2, "color_name": "white" }, { "color_id": 3, "color_name": "black" }]
}

// Fetch categories, series, colors and sizes data to sync
// async function syncFormFields(url: string) {
//   try {
//     const response = await fetch(url, {
//       headers: { "Content-Type": "application/json" },
//     });

//     if (response.ok) {
//       return response.json();
//     } else {
//       throw new Error(`Error submitting form: ${response.status}`);
//     }
//   } catch (error) {
//     console.error("An error occurred:", error);
//   }
// }
// WARN: Backend URL
// syncFormFields("http://localhost:8080/api/productspecifications")
//   .then((response) => {
//     // console.log(response);
//     jsonData = response as JsonData;
//   });

const categoryMap: CategoryMap = {};
jsonData.categories.forEach(category => {
  categoryMap[formatName(category.categoryName)] = category.categoryId;
});

const seriesMap: SeriesMap = {};
jsonData.series.forEach(series => {
  seriesMap[formatName(series.series_name)] = series.series_id;
});

const productColors: ProductColor[] = [];
jsonData.colors.forEach(color => {
  productColors.push({ color_id: color.color_id, color_name: formatName(color.color_name) });
});

const productSizes: ProductSize[] = [];
jsonData.sizes.forEach(size => {
  productSizes.push({ size_id: size.size_id, size_name: formatName(size.size_name) });
});


// Helper function to format names (e.g., short_sleeve_tees to Short Sleeve Tees)
function formatName(name: string) {
  return name.replace(/_/g, ' ') // Replace underscores with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' ');
}

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

const ProductCreationForm = () => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormInputs>({
    resolver: yupResolver(productSchema),
    defaultValues: { productColors: ["Original"], productSizes: ["Small"] },
  });

  const onSubmit: SubmitHandler<ProductFormInputs> = (data) => {
    const dataToSubmit = { ...data }; // Copy data
    // Get id from the name
    dataToSubmit.categoryId = Number(categoryMap[dataToSubmit.categoryId]) as unknown as string;
    dataToSubmit.seriesId = Number(seriesMap[dataToSubmit.seriesId]) as unknown as string;
    dataToSubmit.productColors = dataToSubmit.productColors.map(colorName => {
      const foundColor = productColors.find(color => color.color_name === colorName);
      return foundColor ? foundColor.color_id : colorName; // Return ID or original name if not found
    });
    dataToSubmit.productSizes = dataToSubmit.productSizes.map(sizeName => {
      const foundSize = productSizes.find(size => size.size_name === sizeName);
      return foundSize ? foundSize.size_id : sizeName;
    });
    // Get user id from JWT
    dataToSubmit.userId = tokenDetails()?.id;
    // WARN: Backend URL
    const url = "http://localhost:8080/seller/product";
    console.log(dataToSubmit);
    productFormData(dataToSubmit, url)
      .then((response) => {
        console.log(response);
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
    const currentColors = watch("productColors")?.filter(Boolean) || [];

    const isChecked = typeof checked === 'boolean' ? checked : checked === 'true';

    const newColors = isChecked
      ? [...currentColors, colorName]
      : currentColors.filter((color) => color !== colorName);

    setValue("productColors", newColors);
  };
  const handleSizeChange = (sizeName: string, checked: string | boolean) => {
    const currentSizes = watch("productSizes")?.filter(Boolean) || [];

    // Type guard to ensure checked is a boolean
    const isChecked = typeof checked === 'boolean' ? checked : checked === 'true';

    const newSizes = isChecked
      ? [...currentSizes, sizeName]
      : currentSizes.filter((size) => size !== sizeName);

    setValue("productSizes", newSizes);
  };
  const [categories, _setCategories] = useState(Object.keys(categoryMap));
  const [series, _setSeries] = useState(Object.keys(seriesMap));
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
                  <div className="">
                    {productSizes.map((size) => (
                      <div key={size.size_name} className="flex items-center space-x-2 m-2">
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
                  <div className="">
                    {productColors.map((color) => (
                      <div key={color.color_name} className="flex items-center space-x-2 m-2">
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
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
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
                          {series.map((seriesName) => (
                            <SelectItem key={seriesName} value={seriesName}>
                              {seriesName}
                            </SelectItem>
                          ))}
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

export default ProductCreationForm;
