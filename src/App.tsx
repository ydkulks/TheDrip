import { useState, useEffect, SetStateAction, Dispatch, FC } from "react"
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
  CreditCard,
  Settings,
  User,
  Search,
  ShoppingCart,
  CircleUserRound,
  PanelsTopLeft,
  Truck,
  Menu,
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
import { tokenDetails } from "./components/utils.tsx"
import Cart from "./pages/Cart.tsx"

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

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => handleSelect('/shop')}>
              <ShoppingBag />
              <span>On Sale</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/shop')}>
              <ShoppingBag />
              <span>New Arrivals</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/shop')}>
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
              <PanelsTopLeft />
              <span>Shop</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => handleSelect('/profile')}>
              <User />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/signup')}>
              <CreditCard />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/signup')}>
              <Settings />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

const Navbar: FC<CommandPaletteState> = ({ open, setOpen }) => {
  open;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  interface user {
    name: string
    role: string
    email: string
    avatar: string
  }
  const userData: user = {
    name: tokenDetails().sub,
    role: tokenDetails().role,
    email: tokenDetails().email,
    avatar: 'https://github.com/shadcn.png',
  };
  return (

    <nav className="flex justify-between py-5 px-2 text-sm xl:px-2 2xl:px-[10%]">
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
        <div className="hidden md:flex justify-start gap-3 pt-1">
          <Link to="/shop" className="hover:underline">Shop</Link>
          <Link to="/shop" className="hover:underline">On Sale</Link>
          <Link to="/shop" className="hover:underline">New Arrivals</Link>
          <Link to="/shop" className="hover:underline">Categories</Link>
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Link to="/" className="hidden md:inline">
                <Button variant="ghost" size="icon"><Truck /></Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Order</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
                  On Sale
                </Link>
                <Link to="/" className="flex gap-2 my-2 hover:underline" onClick={() => setMobileMenuOpen(false)}>
                  <ShoppingBag size="16" />
                  New Arrivals
                </Link>
                <Link to="/" className="flex gap-2 my-2 hover:underline" onClick={() => setMobileMenuOpen(false)}>
                  <ShoppingBag size="16" />
                  Categories
                </Link>
                <Link to="/cart" className="flex gap-2 my-2 hover:underline" onClick={() => setMobileMenuOpen(false)}>
                  <ShoppingCart size="16" />
                  Cart
                </Link>
                <Link to="/" className="flex gap-2 my-2 hover:underline" onClick={() => setMobileMenuOpen(false)}>
                  <Truck size="16" />
                  Order
                </Link>
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

function App() {
  const [open, setOpen] = useState(false)
  const location = useLocation();
  const isProfilePage = location.pathname.startsWith('/profile');

  return (
    <>
      {/* NOTE: Announcement banner*/}
      {!isProfilePage &&
        <div className="flex bg-black text-sm text-white w-full justify-center py-2">
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
        </div>
      }

      {!isProfilePage &&
        <Navbar open={open} setOpen={setOpen} />
      }
      <CommandDialogPopup open={open} setOpen={setOpen} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/*" element={<Profile />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/view-product" element={<ViewProduct />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>

      <Toaster />

    </>
  )
}

export default App
