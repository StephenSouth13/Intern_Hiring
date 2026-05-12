import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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

        {/* LEFT - Logo */}
        <Link to="/" className="flex items-center">
          <span className="font-bold text-xl text-primary">
            InternHiring
          </span>
        </Link>

        {/* CENTER - Menu (desktop) */}
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

        {/* RIGHT */}
        <div className="ml-auto flex items-center gap-3">

          {/* DESKTOP AUTH */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 rounded-full transition hover:opacity-80">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0) || (
                        <UserIcon className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <span className="text-sm">
                    {user?.firstName}
                  </span>
                </Link>

                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth")}
                >
                  Đăng nhập
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/auth")}
                >
                  Đăng ký
                </Button>
              </>
            )}
          </div>

          {/* MOBILE MENU */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-64">
                <div className="mt-6 flex flex-col gap-4">

                  {/* MENU ITEMS */}
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="text-base font-semibold"
                    >
                      {item.label}
                    </a>
                  ))}

                  {/* AUTH */}
                  <div className="border-t pt-4">
                    {isAuthenticated ? (
                      <>
                        <Link to="/profile" className="flex items-center gap-2 mb-2 rounded-md p-2 hover:bg-muted transition">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.avatarUrl} />
                            <AvatarFallback>
                              {user?.firstName?.charAt(0) || <UserIcon className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{user?.firstName}</span>
                        </Link>
                        <Button
                          onClick={handleLogout}
                          className="w-full"
                        >
                          Đăng xuất
                        </Button>
                      </>
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