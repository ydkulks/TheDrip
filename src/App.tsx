import { useState, useEffect, SetStateAction, Dispatch, FC, useRef } from "react"
import Home from './pages/Home.tsx'
import Signup from './pages/Signup.tsx'
import Login from './app/login/page.tsx'
import Profile from './pages/Profile.tsx'
import Shop from './pages/Shop.tsx'
import ViewProduct from './pages/ViewProduct.tsx'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from "@/components/ui/button.tsx"
import { Toaster } from '@/components/ui/sonner.tsx'
import {
  ShoppingBag,
  User,
  Search,
  ShoppingCart,
  CircleUserRound,
  PanelsTopLeft,
  Menu,
  X,
  Shirt,
  Book,
  Star,
  ChartColumn,
  ChevronDown,
  Instagram,
  Twitter,
  Youtube,
  ArrowRight,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetFooter, SheetTrigger } from "./components/ui/sheet.tsx"
import { SheetNavUser } from "./components/nav-user.tsx"
import { formatName, prodSpecs, ProdSpecsType, syncProductSpecifications, useTokenDetails } from "./components/utils.tsx"
import Cart from "./pages/Cart.tsx"
import CheckoutPage from "./pages/Checkout.tsx"
import CheckoutSuccess from "./pages/CheckoutSuccess.tsx"
import CheckoutCancel from "./pages/CheckoutCancel.tsx"
import AuthCheck from "./pages/AuthCheck.tsx"
import { Role } from "./components/types.ts"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./components/ui/dropdown-menu.tsx"
import { Input } from "./components/ui/input.tsx"

interface CommandPaletteState {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}
const CommandDialogPopup: FC<CommandPaletteState> = ({ open, setOpen }) => {

  const navigate = useNavigate()

  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const { decodedToken } = useTokenDetails();
  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => handleSelect('/shop?filter=trending')}>
              <ShoppingBag />
              <span>Trending</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/shop')}>
              <ShoppingBag />
              <span>Series</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/')}>
              <ShoppingBag />
              <span>Categories</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => handleSelect('/')}>
              <PanelsTopLeft />
              <span>Home</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/signup')}>
              <PanelsTopLeft />
              <span>Sign up</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/login')}>
              <PanelsTopLeft />
              <span>Login</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/shop')}>
              <ShoppingBag />
              <span>Shop</span>
            </CommandItem>
            {decodedToken.role === "Customer" && (
              <CommandItem onSelect={() => handleSelect('/cart')}>
                <ShoppingCart />
                <span>Cart</span>
              </CommandItem>
            )}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="My Profile">
            <CommandItem onSelect={() => handleSelect('/profile')}>
              <User />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/profile/account')}>
              <User />
              <span>Account</span>
            </CommandItem>
            {/* Customer */}
            {decodedToken.role === "Customer" && (
              <CommandItem onSelect={() => handleSelect('/profile/orders')}>
                <Book />
                <span>Orders</span>
              </CommandItem>
            )}
            {decodedToken.role === "Customer" && (
              <CommandItem onSelect={() => handleSelect('/profile/reviews')}>
                <Star />
                <span>Reviews</span>
              </CommandItem>
            )}
            {/* Seller */}
            {decodedToken.role === "Seller" && (
              <CommandItem onSelect={() => handleSelect('/profile/product_details')}>
                <Shirt />
                <span>Create Product</span>
              </CommandItem>
            )}
            {decodedToken.role === "Seller" && (
              <CommandItem onSelect={() => handleSelect('/profile/product_list')}>
                <Shirt />
                <span>Products</span>
              </CommandItem>
            )}
            {decodedToken.role === "Seller" && (
              <CommandItem onSelect={() => handleSelect('/profile/dashboard')}>
                <ChartColumn />
                <span>Dashboard</span>
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

const Navbar: FC<CommandPaletteState> = ({ open, setOpen }) => {
  const { decodedToken } = useTokenDetails();
  const navigate = useNavigate()
  const [prodSpecsData, setProdSpecsData] = useState(prodSpecs)
  open;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  interface user {
    name: string
    role: string
    email: string
    avatar: string
  }
  const userData: user = {
    name: decodedToken.sub,
    role: decodedToken.role,
    email: decodedToken.email,
    avatar: 'https://github.com/shadcn.png',
  };
  const seriesLinks = [
    { name: "Cyberpunk: Edgerunner", value: 1 },
    { name: "Dragon Ball Super: Super Hero", value: 2 },
    { name: "Chainsaw Man", value: 3 },
  ]

  useEffect(() => {
    syncProductSpecifications()
      .then((response) => {
        setProdSpecsData(response as ProdSpecsType);
      });
  }, [])
  const [categoryLinks, setCategoryLinks] = useState<string[]>([])
  useEffect(() => {
    setCategoryLinks([])
    prodSpecsData.categories.map(items => (
      setCategoryLinks(prevLinks => [...prevLinks, items.categoryName])
    ))
  }, [prodSpecsData.categories])
  return (

    <nav className="flex justify-between py-5 px-2 text-sm xl:px-2 2xl:px-[10%] bg-white z-20">
      <div className="flex justify-start gap-5">
        <h2 className="font-integralcf font-extrabold text-xl md:text-2xl">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Link to="/">
                  THE DRIP.
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Home</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h2>
        <div className="hidden md:flex justify-start pt-1">
          <Button variant="link" onClick={() => navigate("/shop")}>
            Shop
          </Button>
          <Button variant="link" onClick={() => navigate("/shop?filter=trending")}>
            Trending
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                Series <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {seriesLinks.map(link => (
                <DropdownMenuItem key={link.value + link.name} onClick={() => navigate(`/shop?series=${link.value}`)}>
                  {link.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                Categories <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {categoryLinks.map(link => (
                <DropdownMenuItem key={link} onClick={() => navigate(`/shop?category=${link}`)}>
                  {formatName(link)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex justify-end gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                onClick={() => { setOpen((open) => !open) }}
                variant="outline"
                className="rounded-full text-gray-500 hover:text-gray-500">
                <Search />
                <span className="hidden md:inline">Search...</span>
                <code className="hidden md:inline bg-gray-200 text-gray-500 border px-1 rounded-md">⌘ P</code>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Command Palette</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {decodedToken.role === "Customer" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Link to="/cart" className="hidden md:inline">
                  <Button variant="ghost" size="icon"><ShoppingCart /></Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Shopping Cart</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Link to="/profile" className="hidden md:inline" >
                <Button variant="ghost" size="icon"><CircleUserRound /></Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col h-[97%]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-integralcf font-extrabold text-xl md:text-2xl">THE DRIP.</h2>
              </div>
              <div className="text-sm gap-8">
                <Link to="/shop" className="flex gap-2 my-2 hover:underline" onClick={() => setMobileMenuOpen(false)}>
                  <ShoppingBag size="16" />
                  Shop
                </Link>
                <Link to="/shop?filter=trending" className="flex gap-2 my-2 hover:underline" onClick={() => setMobileMenuOpen(false)}>
                  <ShoppingBag size="16" />
                  Trending
                </Link>
                <Link to="/" className="flex gap-2 my-2 hover:underline" onClick={() => setMobileMenuOpen(false)}>
                  <ShoppingBag size="16" />
                  Series
                </Link>
                <Link to="/" className="flex gap-2 my-2 hover:underline" onClick={() => setMobileMenuOpen(false)}>
                  <ShoppingBag size="16" />
                  Categories
                </Link>

                {decodedToken.role === "Customer" && (
                  <Link to="/cart" className="flex gap-2 my-2 hover:underline" onClick={() => setMobileMenuOpen(false)}>
                    <ShoppingCart size="16" />
                    Cart
                  </Link>
                )}

                <Link to="/profile" className="flex text-sm gap-2 my-2 hover:underline" onClick={() => setMobileMenuOpen(false)}>
                  <CircleUserRound size="16" />
                  Profile
                </Link>
              </div>
            </div>
            <SheetFooter>
              <SheetNavUser user={userData} />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const [prodSpecsData, setProdSpecsData] = useState(prodSpecs)

  const [footerLinks, setFotterLinks]  = useState([
    {
      title: "Shop",
      links: [
        { name: "Shop Now", href: "/shop" },
        { name: "Trending", href: "/shop?filter=trending" },
        { name: "New Arrival", href: "/shop?filter=new_arrival" },
      ],
    },
    {
      title: "Series",
      links: [
        { name: "Cyberpunk: Edgerunner", href: "/shop?series=1" },
        { name: "Dragon Ball Super: Super Hero", href: "/shop?series=2" },
        { name: "Chainsaw Man", href: "/shop?series=3" },
      ],
    },
    {
      title: "Categories",
      links: [
        { name: "T-Shirts", href: "#" },
      ],
    },
    {
      title: "Account",
      links: [
        { name: "Profile", href: "/profile" },
        { name: "Sign Up", href: "/signup" },
        { name: "Login", href: "/login" },
      ],
    },
  ])

  useEffect(() => {
    syncProductSpecifications()
      .then((response) => {
        setProdSpecsData(response as ProdSpecsType);
      });
  }, [])
  // const [categoryLinks, setCategoryLinks] = useState<string[]>([])
  useEffect(() => {
    // setCategoryLinks([])
    // prodSpecsData.categories.map(items => (
    //   setCategoryLinks(prevLinks => [...prevLinks, items.categoryName])
    // ))

    if (prodSpecsData?.categories) {
    const newCategoryLinks = prodSpecsData.categories.map(category => ({
      name: formatName(category.categoryName),
      href: `/shop?category=${encodeURIComponent(category.categoryName.toLowerCase().replace(/\s+/g, '-'))}`,
    }));
    // setFotterLinks(footerLinks)// Change categories link
    setFotterLinks(prevFooterLinks =>
        prevFooterLinks.map(group =>
          group.title === "Categories" ? { ...group, links: newCategoryLinks } : group
        )
      );
    }
  }, [prodSpecsData.categories])

  return (
    <footer className="w-full bg-black text-white py-16 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/5 blur-3xl translate-y-1/2 -translate-x-1/4"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Logo and tagline section with enhanced styling */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-16 border-b border-white/10 pb-12"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div>
              <div className="relative inline-block">
                <h2 className="text-4xl md:text-5xl font-integralcf">
                  TheDrip<span className="text-white">.</span>
                </h2>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <p className="text-white/60 max-w-md mt-3 text-lg italic">Low-key Anime, High-key Fashion</p>
              </motion.div>
            </div>

            {/* Newsletter signup with enhanced styling */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-8 md:mt-0 max-w-md"
            >
              <h3 className="text-sm uppercase tracking-widest font-semibold mb-3">Join our Community</h3>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 pr-12 h-12 focus:ring-1 focus:ring-white/30 focus:border-white/30"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-white hover:text-black transition-colors duration-300"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-white/60 mt-2">Get exclusive drops and 10% off your first order</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Links section with enhanced styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {footerLinks.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.4, delay: (i + 3) * 0.1 }}
            >
              <h3 className="text-sm uppercase tracking-widest font-semibold mb-6 after:content-[''] after:block after:w-8 after:h-px after:bg-white/30 after:mt-2">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-white/60 hover:text-white transition-colors duration-300 flex items-center group text-sm"
                    >
                      <span className="relative overflow-hidden">
                        <span className="block transition-transform duration-300 group-hover:translate-y-full">
                          {link.name}
                        </span>
                        <span className="absolute top-0 left-0 -translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          {link.name}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Social and copyright with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="pt-8 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-8 mb-6 md:mb-0">
              <a href="#" className="text-white/40 hover:text-white transition-all duration-300 hover:scale-110">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-all duration-300 hover:scale-110">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-all duration-300 hover:scale-110">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </a>
            </div>

            <div className="text-white/60 text-sm">
              <p>© {new Date().getFullYear()} TheDrip. All rights reserved.</p>
              <div className="flex space-x-6 mt-2 justify-center md:justify-end">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

function App() {
  const [open, setOpen] = useState(false)
  const location = useLocation();
  const isProfilePage = location.pathname.startsWith('/profile');
  const [isBannerOpen, setIsBannerOpen] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsBannerOpen(false);
    }, 500)
  };

  return (
    <>
      <div className="sticky top-0 z-20">
        {/* NOTE: Announcement banner*/}
        {!isProfilePage && isBannerOpen ?
          <div className={`flex bg-black text-sm text-white w-full justify-between py-2 ${isClosing ? 'animate-slide-out-top' : ''}`}>
            <div className="flex justify-center w-full">
              <span>
                Sign up and get 10% off to your first order.
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Link to="/signup"><strong className="underline">Sign up Now</strong></Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Signup</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            </div>
            <Button
              variant="ghost"
              className="p-0 m-0 mr-2 h-4"
              onClick={handleClose}>
              <X />
            </Button>
          </div>
          : null}

        {!isProfilePage &&
          <Navbar open={open} setOpen={setOpen} />
        }
      </div>
      <CommandDialogPopup open={open} setOpen={setOpen} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/view-product" element={<ViewProduct />} />
        <Route path="/profile/*" element={
          <AuthCheck
            allowedRoles={[Role.CUSTOMER, Role.SELLER, Role.ADMIN]}
            children={<Profile />} />
        } />
        <Route path="/cart" element={
          <AuthCheck
            allowedRoles={[Role.CUSTOMER]}
            children={<Cart />} />
        } />
        <Route path="/checkout" element={
          <AuthCheck
            allowedRoles={[Role.CUSTOMER]}
            children={<CheckoutPage />} />
        } />
        <Route path="/checkout/success" element={
          <AuthCheck
            allowedRoles={[Role.CUSTOMER]}
            children={<CheckoutSuccess />} />
        } />
        <Route path="/checkout/cancel" element={
          <AuthCheck
            allowedRoles={[Role.CUSTOMER]}
            children={<CheckoutCancel />} />
        } />
      </Routes>

      <Toaster />
      {!isProfilePage &&
        <Footer />
      }

    </>
  )
}

export default App
