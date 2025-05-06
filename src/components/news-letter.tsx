import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

export function Newsletter() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-muted/70">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto max-w-4xl text-center"
      >
        <h2 className="text-3xl md:text-4xl font-integralcf font-bold mb-4">Join Our Community</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Subscribe to our newsletter for exclusive offers, early access to new collections, and style inspiration
          delivered to your inbox.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.4, delay: 2 * 0.1 }}
        >
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input type="email" placeholder="Enter your email" className="h-12" />
            <Button className="h-12 px-6">
              Subscribe <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
