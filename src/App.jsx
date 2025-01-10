import Home from './pages/Home.jsx'
import Signup from './pages/Signup.jsx'
import { IcOutlineSearch, IcOutlineShoppingCart, IcOutlineAccountCircle } from './assets/svgIcons.jsx'
import { Routes, Route, Link } from 'react-router-dom'

function Navbar() {
  return (

    <nav className="flex justify-between py-5 px-8 text-sm">
      <div className="flex justify-start gap-5">
        <h2 className="font-integralcf font-extrabold text-2xl">
          <Link to="/">
            THE DRIP.
          </Link>
        </h2>
        <div className="flex justify-start gap-3 pt-1">
          <Link to="/" className="hover:underline">Shop</Link>
          <Link to="/" className="hover:underline">On Sale</Link>
          <Link to="/" className="hover:underline">New Arrivals</Link>
          <Link to="/" className="hover:underline">Categories</Link>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button className="text-gray-400 hover:text-black">
          <IcOutlineSearch />
        </button>
        <input type="text" name="search" className="border rounded-full px-2" placeholder="Search" />
        <a href="#" className="hover:text-gray-400 pt-1"><IcOutlineShoppingCart /></a>
        <Link to="/signup" className="hover:text-gray-400 pt-1"><IcOutlineAccountCircle /></Link>
      </div>
    </nav>
  )
}

function App() {

  return (
    <>
      {/* NOTE: Announcement banner*/}
      <div className="flex bg-black text-sm text-white justify-center py-2">
        Sign up and get 20% off to your first order.
        <Link to="/signup"><strong className="underline">Sign up Now</strong></Link>
      </div>

      {/* TODO: Navbar functionality
        - Working in-page navigation links [Shop, On Sale, New Arrivals, Categories]
        - Working search bar
        - Cart
        - Sign up
        - Reactive layout
    */}
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>

    </>
  )
}

export default App
