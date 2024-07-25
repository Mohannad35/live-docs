import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const Header = ({ children, className }: HeaderProps) => {
  return (
    <div className={cn("header", className)}>
      <Link className="md:flex-1" href="/">
        <Image
          alt="Logo with name"
          className="hidden md:block"
          height={32}
          src="/assets/icons/logo.svg"
          width={120}
        />
        <Image
          alt="Logo"
          className="mr-2 block md:hidden"
          height={32}
          src="/assets/icons/logo-icon.svg"
          width={32}
        />
      </Link>
      {children}
    </div>
  );
};

export default Header;
