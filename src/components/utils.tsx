import { toast } from "sonner"
import { X } from 'lucide-react'
import { jwtDecode } from "jwt-decode";

export function getCurrentTime(): string {
  const currentTime = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = days[currentTime.getDay()]; // Get the day of the week in words
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = months[currentTime.getMonth()];
  const isAm = currentTime.getHours() < 12;
  const hours = (currentTime.getHours() % 12 || 12).toString().padStart(2, '0'); // Convert to 12-hour format
  const minutes = currentTime.getMinutes().toString().padStart(2, '0'); // Add minutes to the time

  if (isAm) {
    return `${dayName}, ${monthName} ${currentTime.getDate()}, ${currentTime.getFullYear()} at ${hours}:${minutes} AM`;
  } else {
    return `${dayName}, ${monthName} ${currentTime.getDate()}, ${currentTime.getFullYear()} at ${hours}:${minutes} PM`;
  }
}

export function toastNotification(message: string, description: string | undefined) {
  toast(message, {
    description: description,
    action: {
      label: <X className="text-gray-500 hover:text-black" />,
      onClick: () => console.log(),
    },
  })
}

interface tokenType {
  email: string;
  exp: number;
  iat: number;
  id: number;
  role: string;
  sub: string;
}
export function tokenDetails(): tokenType {
  const token = localStorage.getItem("token");
  let decodedToken: tokenType;
  if (token != null) {
    decodedToken = jwtDecode(token);
    return decodedToken;
  }
  return { email: "", exp: 0, iat: 0, id: 0, role: "", sub: "" };
}

// Helper function to format names (e.g., short_sleeve_tees to Short Sleeve Tees)
export function formatName(name: string) {
  return name.replace(/_/g, ' ') // Replace underscores with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' ');
}

interface CategoryType {
  categoryId: number;
  categoryName: string;
}

interface SeriesType {
  series_id: number;
  series_name: string;
}

interface SizeType {
  size_id: number;
  size_name: string;
}

interface ColorType {
  color_id: number;
  color_name: string;
}
export interface ProdSpecsType {
  categories: CategoryType[];
  series: SeriesType[];
  sizes: SizeType[];
  colors: ColorType[];
}
// Default value
export var prodSpecs: ProdSpecsType = {
  "categories": [{ "categoryId": 1, "categoryName": "short_sleeve_tees" }, { "categoryId": 2, "categoryName": "long_sleeve_tees" }, { "categoryId": 3, "categoryName": "button_down_shirt" }, { "categoryId": 4, "categoryName": "hoodies" }, { "categoryId": 5, "categoryName": "cargos" }, { "categoryId": 6, "categoryName": "shorts" }, { "categoryId": 7, "categoryName": "sweat_pants" }, { "categoryId": 8, "categoryName": "tops" }, { "categoryId": 9, "categoryName": "bottoms" }, { "categoryId": 10, "categoryName": "bomber_jackets" }],
  "series": [{ "series_id": 1, "series_name": "Cyberpunk: Edgerunners" }, { "series_id": 2, "series_name": "Dragon Ball Super: Super Hero" }],
  "sizes": [{ "size_id": 1, "size_name": "small" }, { "size_id": 2, "size_name": "medium" }, { "size_id": 3, "size_name": "large" }, { "size_id": 4, "size_name": "extra_large" }, { "size_id": 5, "size_name": "double_extra_large" }],
  "colors": [{ "color_id": 1, "color_name": "original" }, { "color_id": 2, "color_name": "white" }, { "color_id": 3, "color_name": "black" }]
}

// Fetch categories, series, colors and sizes data to sync
// WARN: Backend URL
export async function syncProductSpecifications() {
  try {
    const response = await fetch("http://localhost:8080/api/productspecifications", {
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      return response.json();
    } else {
      return prodSpecs;
      // throw new Error(`Error submitting form: ${response.status}`);
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return prodSpecs;
  }
}
// syncFormFields()
//   .then((response) => {
//     // console.log(response);
//     jsonData = response as JsonData;
//   });
