import { Button } from "@/components/ui/button.tsx"
// Images
import HeroSection from '/images/HeroSectionWithStars.png'
import Atsuko from '/images/Atsuko_Logo_Red2022.png'
import Hypland from '/images/hypland-logo-hires-3.webp'
import Crunchyroll from '/images/Crunchyroll-Emblem.png'
import Ckwai from '/images/ckwai_logo.png'
import Nonsense from '/images/null_w_text.png'
import Supersick from '/images/Super.png'
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { FeaturedSeries } from "@/components/featured-series"
import { CategoryShowcase } from "@/components/category-showcase"
import { useRef } from "react"
import { Newsletter } from "@/components/news-letter"
import TrendingNow from "@/components/trending-now"

function Hero() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center bg-[#f2f0f1] px-10 lg:px-[10%]">
      <div className="lg:max-w-[50%]">
        <p className="font-extrabold text-5xl font-integralcf mt-14">FIND CLOTHES </p>
        <p className="font-extrabold text-5xl font-integralcf">THAT MATCHES </p>
        <p className="font-extrabold text-5xl font-integralcf">YOUR STYLE</p>
        <p className="text-gray-500 my-5">
          Browse through our diverse range of meticulously crafted anime street-ware, designed
          to bring out your individuality and cater to your sense of style and love for anime.
        </p>
        <Link to="/shop">
          <Button className="px-12 py-5 mb-10 rounded-full bg-black text-white font-bold hover:bg-white hover:text-black">
            Shop Now
          </Button>
        </Link>
        <div className="flex">
          <div>
            <p className="text-2xl font-bold">200+</p>
            <p className="text-gray-500">High-Quality Products</p>
          </div>
          <div className="w-[2px] bg-gray-400 mx-5 my-1"></div>
          <div>
            <p className="text-2xl font-bold">30,000+</p>
            <p className="text-gray-500">Happy Customers</p>
          </div>
        </div>
      </div>
      <div>
        <img src={HeroSection} alt="HeroSection" />
      </div>
    </header>
  )
}

const Home = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  return (
    <div>
      <Hero />

      {/* TODO: Seamless infinite scrolling */}
      <marquee behavior="scroll" direction="left" className="bg-black h-16 text-white">
        <div className="flex mt-3 h-10 gap-28">
          <img src={Nonsense} alt="nonsense" />
          <img src={Supersick} alt="Supersick" />
          <img src={Atsuko} alt="atsuko" />
          <img src={Hypland} alt="hypland" />
          <img src={Crunchyroll} alt="crunchyroll" />
          <img src={Ckwai} alt="ckawai" />
        </div>
      </marquee>

      <FeaturedSeries />
      <CategoryShowcase />

      {/* Trending Now */}
      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-integralcf mb-4 ml-5">Trending Now</h2>
            <p className="text-muted-foreground max-w-2xl mb-12 ml-5">
              Our most popular items this season
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <TrendingNow />
          </motion.div>
        </div>
      </section>

      <Newsletter />
    </div>
  )
}

export default Home
