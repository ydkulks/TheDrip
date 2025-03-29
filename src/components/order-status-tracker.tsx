import { useEffect, useState } from "react"
import { CheckCircle2, Package, Truck, User } from "lucide-react"

export function OrderStatusTracker() {
  const [truckPosition, setTruckPosition] = useState(0)

  useEffect(() => {
    // For demo purposes, animate the truck
    const interval = setInterval(() => {
      setTruckPosition((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="py-4">
      <h3 className="font-medium mb-6">Order Status</h3>

      <div className="relative z-0">
        {/* Status line */}
        <div className="absolute top-5 left-0 w-full h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${truckPosition}%` }}
          />
        </div>

        {/* Moving truck */}
        <div
          className="absolute top-0 -translate-x-1/2 transition-all duration-500 ease-out"
          style={{ left: `${truckPosition}%` }}
        >
          <div className="bg-background p-1 rounded-full border-2 border-primary">
            <Truck className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Status points */}
        <div className="flex justify-between relative z-0">
          <div className="flex flex-col items-center">
            <div
              className={`rounded-full p-1 ${truckPosition >= 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <Package className="h-6 w-6" />
            </div>
            <span className="text-xs mt-8 text-center">Order Placed</span>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`rounded-full p-1 ${truckPosition >= 33 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <span className="text-xs mt-8 text-center">Processing</span>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`rounded-full p-1 ${truckPosition >= 66 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <Truck className="h-6 w-6" />
            </div>
            <span className="text-xs mt-8 text-center">Shipped</span>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`rounded-full p-1 ${truckPosition >= 100 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <User className="h-6 w-6" />
            </div>
            <span className="text-xs mt-8 text-center">Delivered</span>
          </div>
        </div>
      </div>
    </div>
  )
}
