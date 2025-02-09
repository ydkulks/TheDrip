import { Button } from "@/components/ui/button.tsx"
// Images
import HeroSection from '/images/HeroSectionWithStars.png'
import Atsuko from '/images/Atsuko_Logo_Red2022.png'
import Hypland from '/images/hypland-logo-hires-3.webp'
import Crunchyroll from '/images/Crunchyroll-Emblem.png'
import Ckwai from '/images/ckwai_logo.png'
import Nonsense from '/images/null_w_text.png'
import Supersick from '/images/Super.png'

function Hero() {
  return (
    <header className="flex justify-between items-center bg-[#f2f0f1] px-10 lg:px-[10%]">
      <div className="lg:max-w-[50%]">
        <p className="font-extrabold text-5xl font-integralcf mt-14">FIND CLOTHES </p>
        <p className="font-extrabold text-5xl font-integralcf">THAT MATCHES </p>
        <p className="font-extrabold text-5xl font-integralcf">YOUR STYLE</p>
        <p className="text-gray-500 my-5">
          Browse through our diverse range of meticulously crafted anime street-ware, designed
          to bring out your individuality and cater to your sense of style and love for anime.
        </p>
        <Button className="px-12 py-5 mb-10 rounded-full bg-black text-white font-bold hover:bg-white hover:text-black">
          Shop Now
        </Button>
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
  return (
    <div>
      {/* TODO: Reactive layout */}
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
    </div>
  )
}

export default Home
