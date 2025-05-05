import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import SeriesBig from '/images/seriesBig.webp'
import SeriesSmall from '/images/seriesSmall.webp'
import { useNavigate } from "react-router-dom"

export function FeaturedSeries() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const navigate = useNavigate()

  function handleSeriesFilter() {
    navigate("/shop?series=1")
  }

  return (
    <section className="py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        >
          <div className="order-2 lg:order-1 mr-8">
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="relative z-10 aspect-[4/5] rounded-2xl overflow-hidden"
              >
                <img
                  src={SeriesBig || "https://placehold.co/700x800/svg"}
                  alt="Summer Collection"
                  className="object-cover rounded-2xl"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="absolute -bottom-10 -right-10 w-2/3 aspect-square rounded-2xl overflow-hidden border-8 border-background shadow-xl z-10"
              >
                <img
                  src={SeriesSmall || "https://placehold.co/500x500/svg"}
                  alt="Featured Product"
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-integralcf mb-6">CIBERPUNK: EDGERUNNER</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Step into the chrome and neon with our latest collection. Each piece echoes the grit and style of Night City, crafted with the same meticulous detail you'd expect from a techrunner's gear. Feel the rebellious spirit of a certain crew and the unwavering determination of its legends woven into every thread. These high-quality garments are your everyday armor, ready for whatever the streets throw your way. Express your inner edgerunner with a look that's both subtly powerful and undeniably cool.
            </p>
            <Button size="lg" className="group" onClick={handleSeriesFilter}>
              Explore Series
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
