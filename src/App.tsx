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
  LayoutDashboard,
  ChevronDown,
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
                <LayoutDashboard />
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
          <Button variant="link" onClick={() => navigate("/")}>
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
                <Link to="/" className="flex gap-2 my-2 hover:underline" onClick={() => setMobileMenuOpen(false)}>
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
  return (
    <div>
      <footer className="w-full bg-black text-white py-12">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-integralcf mb-4 ml-5">TheDrip.</h2>
          <p className="text-muted-foreground max-w-2xl mb-12 ml-5">
            Low-key Anime, High-key Fashion
          </p>
        </motion.div>
      </footer>
    </div>
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
                Sign up and get 20% off to your first order.
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
