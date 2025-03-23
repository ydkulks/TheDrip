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
import { useEffect, useState } from "react";
// UI
import { getCurrentTime, prodSpecs, ProdSpecsType, syncProductSpecifications, toastNotification, tokenDetails } from "@/components/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductUploader } from "@/components/product-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

async function productFormData(data: ProductFormInputs[], url: string) {
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

const ProductCreationForm = () => {
  const [prodSpecsData, setProdSpecsData] = useState(prodSpecs);
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

  useEffect(() => {
    syncProductSpecifications()
      .then((response) => {
        setProdSpecsData(response as ProdSpecsType);
      });
  }, [])

  const categoryMap: CategoryMap = {};
  prodSpecsData.categories.forEach(category => {
    categoryMap[formatName(category.categoryName)] = category.categoryId;
  });

  const seriesMap: SeriesMap = {};
  prodSpecsData.series.forEach(series => {
    seriesMap[formatName(series.seriesName)] = series.series_id;
  });

  const productColors: ProductColor[] = [];
  prodSpecsData.colors.forEach(color => {
    productColors.push({ color_id: color.color_id, color_name: formatName(color.color_name) });
  });

  const productSizes: ProductSize[] = [];
  prodSpecsData.sizes.forEach(size => {
    productSizes.push({ size_id: size.size_id, size_name: formatName(size.size_name) });
  });


  // Helper function to format names (e.g., short_sleeve_tees to Short Sleeve Tees)
  function formatName(name: string) {
    return name.replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(' ');
  }

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
      .oneOf(prodSpecsData.categories.map(index => (formatName(index.categoryName))), "Invalid category selected")
      .required("Category Id is required"),
    seriesId: yup
      .string()
      .oneOf(prodSpecsData.series.map(index => (index.seriesName)), "Invalid series selected")
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

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormInputs>({
    resolver: yupResolver(productSchema), defaultValues: { productColors: ["Original"], productSizes: ["Small"] },
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
    const url = "http://localhost:8080/seller/products";
    productFormData([dataToSubmit], url)
      .then((_response) => {
        // console.log(response);
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
  return (
    <div className="flex w-full items-center justify-center p-2">
      <Tabs defaultValue="create" className="w-full">
        <TabsList>
          <TabsTrigger value="create">Create Product</TabsTrigger>
          <TabsTrigger value="upload">Upload Products</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <div className="w-full inline-flex justify-center">
            <Card className="w-full max-w-3xl">
              <CardHeader>
                <CardTitle className="text-xl">Create New Product</CardTitle>
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
                      <div className="grid grid-cols-2 gap-2">
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
                      <div className="grid grid-cols-2 gap-2">
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
                          <Select onValueChange={field.onChange} value={field.value || "Select category"}>
                            <SelectTrigger>
                              <SelectValue>
                                {field.value || "Select category"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {prodSpecsData.categories.map((category) => (
                                <SelectItem key={category.categoryName} value={formatName(category.categoryName)}>
                                  {formatName(category.categoryName)}
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
                          <Select onValueChange={field.onChange} value={field.value || "Select series"}>
                            <SelectTrigger>
                              <SelectValue> {field.value || "Select series"} </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {prodSpecsData.series.map(seriesItem => (
                                <SelectItem key={seriesItem.seriesName} value={seriesItem.seriesName}>
                                  {seriesItem.seriesName}
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
                      <Button type="reset" variant="outline" className="w-full"> Reset </Button>
                      <Button type="submit" className="w-full"> Submit </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="upload"> <ProductUploader /></TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductCreationForm;
