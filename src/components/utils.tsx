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
