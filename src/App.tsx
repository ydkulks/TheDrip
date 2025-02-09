import { useState, useEffect, SetStateAction, Dispatch, FC } from "react"
import Home from './pages/Home.tsx'
import Signup from './pages/Signup.tsx'
import Login from './app/login/page.tsx'
import Profile from './pages/Profile.tsx'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
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
            <CommandItem onSelect={() => handleSelect('/')}>
              <ShoppingBag />
              <span>On Sale</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/')}>
              <ShoppingBag />
              <span>New Arrivals</span>
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
  return (

    <nav className="flex justify-between py-5 px-8 text-sm lg:px-[10%]">
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
      <div className="flex justify-end gap-1">
        <Button onClick={() => { setOpen((open) => !open) }} variant="outline" className="rounded-full text-gray-500 hover:text-gray-500">
          <Search />Search... <code className="bg-gray-200 text-gray-500 border px-1 rounded-md">⌘ P</code>
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Link to="/">
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
              <Link to="/">
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
              <Link to="/profile" >
                <Button variant="ghost" size="icon"><CircleUserRound /></Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </nav>
  )
}

function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* NOTE: Announcement banner*/}
      <div className="flex bg-black text-sm text-white justify-center py-2">
        Sign up and get 20% off to your first order.
        <Link to="/signup"><strong className="underline">Sign up Now</strong></Link>
      </div>

      {/* TODO: Navbar functionality
        - Cart
        - Profile
        - Reactive layout
    */}
      <Navbar open={open} setOpen={setOpen} />
      <CommandDialogPopup open={open} setOpen={setOpen} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>

      <Toaster />

    </>
  )
}

export default App
