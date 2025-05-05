import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import ShortSleeveTees from '/images/shortSleeveTees.webp'
import ButtonDownShirt from '/images/buttonDownShirt.webp'
import Cargos from '/images/cargos.webp'
import BomberJackets from '/images/bomberJackets.webp'
import LongSleeveTees from '/images/longSleeveTees.webp'
import Hoodies from '/images/hoodies.webp'
import SweatPants from '/images/sweatPants.webp'
import Shorts from '/images/shorts.webp'
import Accessories from '/images/accessories.webp'
import Hats from '/images/hats.webp'

// Define the category type
type Category = {
  id: string
  name: string
  image: string
  hoverImage: string
  featured?: boolean
}

// Categories data
const categories: Category[] = [
  {
    id: "short_sleeve_tees",
    name: "Short Sleeve Tees",
    image: ShortSleeveTees,
    hoverImage: ShortSleeveTees,
    featured: true,
  },
  {
    id: "long_sleeve_tees",
    name: "Long Sleeve Tees",
    image: LongSleeveTees,
    hoverImage: LongSleeveTees,
  },
  {
    id: "button_down_shirt",
    name: "Button Down Shirts",
    image: ButtonDownShirt,
    hoverImage: ButtonDownShirt,
    featured: true,
  },
  {
    id: "hoodies",
    name: "Hoodies",
    image: Hoodies,
    hoverImage: Hoodies,
  },
  {
    id: "cargos",
    name: "Cargos",
    image: Cargos,
    hoverImage: Cargos,
    featured: true,
  },
  {
    id: "shorts",
    name: "Shorts",
    image: Shorts,
    hoverImage: Shorts,
  },
  {
    id: "sweat_pants",
    name: "Sweat Pants",
    image: SweatPants,
    hoverImage: SweatPants,
  },
  {
    id: "hats",
    name: "Hats",
    image: Hats,
    hoverImage: Hats,
  },
  {
    id: "accessories",
    name: "Accessories",
    image: Accessories,
    hoverImage: Accessories,
  },
  {
    id: "bomber_jackets",
    name: "Bomber Jackets",
    image: BomberJackets,
    hoverImage: BomberJackets,
    featured: true,
  },
]

function FeaturedCategory({ category }: { category: Category }) {
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative aspect-[3/4] overflow-hidden rounded-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/shop?category=${category.id}`} className="block h-full w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
        <motion.div
          className="relative h-full w-full"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.4 }}
        >
          <img
            src={isHovered ? category.hoverImage : category.image}
            alt={category.name}
            className="object-cover"
          />
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10 text-white">
          <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
          <motion.div
            className="flex items-center text-sm font-medium"
            animate={{ x: isHovered ? 5 : 0 }}
            transition={{ duration: 0.2 }}
          >
            Shop Now <ChevronRight className="h-4 w-4 ml-1" />
          </motion.div>
        </div>
      </Link>
    </motion.div>
  )
}

function CategoryCard({ category, index }: { category: Category; index: number }) {
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-lg bg-background"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/shop?category=${category.id}`} className="block">
        <div className="aspect-square overflow-hidden">
          <motion.div
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.4 }}
            className="h-full w-full relative"
          >
            <img
              src={isHovered ? category.hoverImage : category.image}
              alt={category.name}
              className="object-cover"
            />
          </motion.div>
        </div>
        <div className="p-4">
          <h3 className="font-medium text-lg group-hover:text-primary transition-colors">{category.name}</h3>
          <motion.div
            className="mt-1 text-sm text-muted-foreground flex items-center"
            animate={{ x: isHovered ? 5 : 0 }}
            transition={{ duration: 0.2 }}
          >
            Explore <ChevronRight className="h-3 w-3 ml-1" />
          </motion.div>
        </div>
      </Link>
    </motion.div>
  )
}

export function CategoryShowcase() {
  const featuredCategories = categories.filter((cat) => cat.featured)
  const regularCategories = categories.filter((cat) => !cat.featured)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section className="py-16 px-4 md:px-6 lg:px-8 bg-black">
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white font-integralcf mb-4">Shop By Category</h2>
          <p className="text-gray-200 max-w-2xl mx-auto">
            Discover our curated collection of premium apparel designed for style and comfort
          </p>
        </motion.div>

        {/* Featured categories in a creative layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredCategories.slice(0, 4).map((category, _index) => (
            <FeaturedCategory key={category.id} category={category} />
          ))}
        </div>

        {/* Regular categories in a grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {regularCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
