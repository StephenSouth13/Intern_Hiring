import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSiteContent } from "@/lib/site-content";

const Header = () => {
  const { siteContent } = useSiteContent();
  const navItems = [
    { label: siteContent.header.introLabel, href: "#gioi-thieu" },
    { label: siteContent.header.objectivesLabel, href: "#muc-tieu" },
    { label: siteContent.header.timelineLabel, href: "#lo-trinh" },
    { label: siteContent.header.benefitsLabel, href: "#quyen-loi" },
    { label: siteContent.header.partnersLabel, href: "#doi-tac" },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-soft backdrop-blur-md">
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

        <div className="hidden md:block">
          <Button variant="cta" size="sm" asChild>
            <a href="#dang-ky">{siteContent.header.ctaLabel}</a>
          </Button>
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
              <Button variant="cta" className="mt-4" asChild>
                <a href="#dang-ky">{siteContent.header.ctaLabel}</a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
