import { Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  /*const navItems = [
    { label: siteContent.header.introLabel, href: "#gioi-thieu" },
    { label: siteContent.header.objectivesLabel, href: "#muc-tieu" },
    { label: siteContent.header.timelineLabel, href: "#lo-trinh" },
    { label: siteContent.header.benefitsLabel, href: "#quyen-loi" },
    { label: siteContent.header.partnersLabel, href: "#doi-tac" },
  ]; 
*/
const navItems = [
  { label: "Giới thiệu", href: "#gioi-thieu" },
  { label: "Mục tiêu", href: "#muc-tieu" },
  { label: "Lộ trình", href: "#lo-trinh" },
  { label: "Quyền lợi", href: "#quyen-loi" },
  { label: "Đối tác", href: "#doi-tac" },
];
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="w-full border-b border-slate-200 bg-white shadow-soft">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="hidden w-24 md:block" />

        <nav className="hidden items-center gap-14 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-2 text-[1.4rem] font-bold text-black transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {user.firstName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                Đăng nhập
              </Button>
              <Button variant="cta" size="sm" onClick={() => navigate("/auth")}>
                Đăng ký
              </Button>
            </div>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Mở menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="mt-8 flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-3 text-base font-semibold text-foreground transition-colors hover:bg-secondary hover:text-primary"
                >
                  {item.label}
                </a>
              ))}
              {isAuthenticated && user ? (
                <div className="mt-6 space-y-2 border-t pt-4">
                  <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-600">{user.email}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2 text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <div className="mt-6 space-y-2 border-t pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/auth")}
                  >
                    Đăng nhập
                  </Button>
                  <Button 
                    variant="cta" 
                    className="w-full"
                    onClick={() => navigate("/auth")}
                  >
                    Đăng ký
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
