import { Outlet } from "@tanstack/react-router";
import { CMSLink } from "../components/cms/components/CMSLink";
import { Search } from "../components/cms/components/Search";
import Logo from "../components/logo";
import { useAppContext } from "../hooks/useAppContext";

export function RootLayout() {
  const { tenant } = useAppContext();

  return <>
    <div className="navbar p-5 bg-transparent">
      <Logo className="basis-10 w-10 h-10 shrink-0 mr-8" />
      <Search className="mr-2" />
      {tenant?.headerNavItems?.map(item => {
        return <CMSLink key={item.id} className="btn btn-ghost" {...item.link}/>
      })}
    </div>
    <Outlet />
    <footer className="footer bg-base-200 p-10 mt-10">
      <aside className="flex gap-8 flex-wrap">
        <Logo className="basis-16 w-16 h-16 shrink-0" />
        <img src="/payload_logo.svg" className="w-16 h-16"/>
      </aside>
      <nav>
        <h6 className="footer-title">Footer Links</h6>
        {tenant?.footerNavItems?.map(item => {
          return <CMSLink key={item.id} className="link link-hover" {...item.link}/>
        })}
      </nav>
    </footer>
  </>;
}
