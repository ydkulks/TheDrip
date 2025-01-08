// import viteLogo from '/vite.svg'
import { IcOutlineSearch, IcOutlineShoppingCart, IcOutlineAccountCircle } from './assets/svgIcons.jsx'
import HeroSection from './assets/HeroSectionWithStars.png'

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
        <p className="font-extrabold text-5xl font-integralcf mt-28">FIND CLOTHES </p>
        <p className="font-extrabold text-5xl font-integralcf">THAT MATCHES </p>
        <p className="font-extrabold text-5xl font-integralcf">YOUR STYLE</p>
        <p className="text-gray-500 my-5">
          Browse through our diverse range of meticulously crafted anime street-ware, designed
          to bring out your individuality and cater to your sense of style and love for anime.
        </p>
        <button className="px-10 py-3 mb-28 rounded-full bg-black text-white font-bold hover:bg-white hover:text-black">Shop Now</button>
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
      <div className="flex bg-black text-sm text-white justify-center py-2">Sign up and get 20% off to your first order.
        <strong className="underline">Sign up Now</strong>
      </div>

      <Navbar />
      <Hero />

    </>
  )
}

export default App
