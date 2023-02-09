import React from "react";

type NavLinkProps = React.PropsWithChildren<LinkProps> & {
  activeClassName?: string;
  className: string;
  href: string;
};

export const NavLink = ({
  href,
  children,
  className,
  onClick,
  ...props
}: NavLinkProps) => {
  const { asPath } = useRouter();
  const isActive = asPath === href || asPath.startsWith(href);

  if (isActive) {
    className += " active !text-indigo-500";
  }

  return (
    <Link href={href}>
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    </Link>
  );
};
