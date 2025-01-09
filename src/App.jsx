import { IcOutlineSearch, IcOutlineShoppingCart, IcOutlineAccountCircle } from './assets/svgIcons.jsx'
// Images
import HeroSection from '/images/HeroSectionWithStars.png'
import Atsuko from '/images/Atsuko_Logo_Red2022.png'
import Hypland from '/images/hypland-logo-hires-3.webp'
import Crunchyroll from '/images/Crunchyroll-Emblem.png'
import Ckwai from '/images/ckwai_logo.png'
import Nonsense from '/images/null_w_text.png'
import Supersick from '/images/Super.png'

function Navbar() {
  return (

    <nav className="flex justify-between py-5 px-8 text-sm">
      <div className="flex justify-start gap-5">
        <h2 className="font-integralcf font-extrabold text-2xl">THE DRIP.</h2>
        <div className="flex justify-start gap-3 pt-1">
          <a href="#" className="hover:underline">Shop</a>
          <a href="#" className="hover:underline">On Sale</a>
          <a href="#" className="hover:underline">New Arrivals</a>
          <a href="#" className="hover:underline">Categories</a>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button className="text-gray-400 hover:text-black">
          <IcOutlineSearch />
        </button>
        <input type="text" name="search" className="border rounded-full px-2" placeholder="Search" />
        <a href="#" className="hover:text-gray-400 pt-1"><IcOutlineShoppingCart /></a>
        <a href="#" className="hover:text-gray-400 pt-1"><IcOutlineAccountCircle /></a>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <header className="flex justify-between bg-[#f2f0f1] px-10">
      <div className="lg:max-w-[50%]">
        <p className="font-extrabold text-5xl font-integralcf mt-14">FIND CLOTHES </p>
        <p className="font-extrabold text-5xl font-integralcf">THAT MATCHES </p>
        <p className="font-extrabold text-5xl font-integralcf">YOUR STYLE</p>
        <p className="text-gray-500 my-5">
          Browse through our diverse range of meticulously crafted anime street-ware, designed
          to bring out your individuality and cater to your sense of style and love for anime.
        </p>
        <button className="px-10 py-3 mb-10 rounded-full bg-black text-white font-bold hover:bg-white hover:text-black">
          Shop Now
        </button>
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

function App() {

  return (
    <>
      <div className="flex bg-black text-sm text-white justify-center py-2">
        Sign up and get 20% off to your first order.
        <a href="#"><strong className="underline">Sign up Now</strong></a>
      </div>

      {/* TODO: Navbar functionality
        - Working in-page navigation links [Shop, On Sale, New Arrivals, Categories]
        - Working search bar
        - Cart
        - Sign up
        - Reactive layout
    */}
      <Navbar />
      {/* TODO: Reactive layout */}
      <Hero />

      {/* TODO: Seamless infinite scrolling */}
      <marquee behavior="scroll" direction="left" className="bg-black h-16 text-white">
        <div className="flex mt-3 h-10 gap-28">
          <img src={Nonsense} alt="nonsense" />
          <img src={Supersick} alt="nonsense" />
          <img src={Atsuko} alt="atsuko" />
          <img src={Hypland} alt="hypland" />
          <img src={Crunchyroll} alt="crunchyroll" />
          <img src={Ckwai} alt="ckawai" />
        </div>
      </marquee>

    </>
  )
}

export default App
