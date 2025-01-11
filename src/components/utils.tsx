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
