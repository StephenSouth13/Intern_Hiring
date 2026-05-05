import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronDown, LogOut, Menu, User as UserIcon } from "lucide-react";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleLogoClick = (event) => {
    event.preventDefault();

    if (location.pathname !== "/") {
      navigate("/");
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const displayName =
    [user?.lastName, user?.firstName].filter(Boolean).join(" ") ||
    user?.email ||
    "Người dùng";
  const shortName = user?.firstName || user?.email?.split("@")[0] || "Người dùng";
  const fallbackInitial = (user?.firstName || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  const navItems = [
    { label: "Giới thiệu", href: "#gioi-thieu" },
    { label: "Mục tiêu", href: "#muc-tieu" },
    { label: "Lộ trình", href: "#lo-trinh" },
    { label: "Quyền lợi", href: "#quyen-loi" },
    { label: "Đối tác", href: "#doi-tac" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto relative flex h-16 items-center px-4">
        <Link to="/" className="flex items-center" onClick={handleLogoClick}>
          <span className="font-bold text-xl text-primary">InternHiring</span>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-black hover:text-primary transition"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl} alt={displayName} />
                      <AvatarFallback>{fallbackInitial}</AvatarFallback>
                    </Avatar>
                    <span className="max-w-32 truncate text-sm font-medium">
                      {shortName}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="truncate text-sm font-medium">{displayName}</p>
                      {user?.email && (
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => navigate("/profile")}
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Hồ sơ
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onSelect={() => void handleLogout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth")}
                >
                  Đăng nhập
                </Button>
                <Button size="sm" onClick={() => navigate("/auth")}>
                  Đăng ký
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-64">
                <div className="mt-6 flex flex-col gap-4">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="text-base font-semibold"
                    >
                      {item.label}
                    </a>
                  ))}

                  <div className="border-t pt-4">
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.avatarUrl} alt={displayName} />
                            <AvatarFallback>{fallbackInitial}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {displayName}
                            </p>
                            {user?.email && (
                              <p className="truncate text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            )}
                          </div>
                        </div>

                        <SheetClose asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => navigate("/profile")}
                          >
                            <UserIcon className="h-4 w-4" />
                            Hồ sơ
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            variant="destructive"
                            className="w-full justify-start"
                            onClick={() => void handleLogout()}
                          >
                            <LogOut className="h-4 w-4" />
                            Đăng xuất
                          </Button>
                        </SheetClose>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="w-full mb-2"
                          onClick={() => navigate("/auth")}
                        >
                          Đăng nhập
                        </Button>
                        <Button
                          className="w-full"
                          onClick={() => navigate("/auth")}
                        >
                          Đăng ký
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
