import { Suspense, useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ChevronRight, BookOpen } from "lucide-react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

const chapters = [
  { path: "/requirement4", title: "chapter4" },
  { path: "/requirement5", title: "chapter5" },
  { path: "/requirement6", title: "chapter6" },
  { path: "/requirement7", title: "chapter7" },
];

export default function Layout() {
  const { t } = useTranslation('navigation');
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  const main = useRef<HTMLElement>(null);
  const requirement = /^\/requirement[4-7]/.test(pathname);
  const chapter = chapters.find(item => pathname.startsWith(item.path));
  useEffect(() => {
    if (previousPath.current !== pathname) {
      main.current?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
      previousPath.current = pathname;
    }
  }, [pathname]);
  return <div className="flex min-h-screen flex-col">
    <a className="sr-only z-50 rounded-md bg-primary p-4 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4" href="#conteudo">{t('skip')}</a>
    <Navbar />
    <main id="conteudo" ref={main} tabIndex={-1} className="page-shell flex-1 py-8 outline-none sm:py-12">
      {requirement ? <>
            <nav aria-label={t('breadcrumb')} className="mb-8 flex flex-wrap items-center gap-2 text-base text-muted-foreground">
              <Link to="/requirement" className="text-link">{t('guidance')}</Link><ChevronRight className="size-4" aria-hidden="true" /><span>{chapter ? t(chapter.title) : ''}</span>
        </nav>
        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside className="min-w-0">
            <p className="mb-3 flex items-center gap-2 text-base font-semibold"><BookOpen className="size-5" aria-hidden="true" />{t('exploreGuide')}</p>
            <nav aria-label={t('chapters')} className="grid gap-2">
              {chapters.map(item => <Button key={item.path} asChild variant={chapter?.path === item.path ? "secondary" : "ghost"} className="justify-start text-left"><Link to={item.path} aria-current={pathname === item.path ? "page" : undefined}>{item.title}</Link></Button>)}
            </nav>
            <p className="mt-5 text-base text-muted-foreground">{t('chapterHelp')}</p>
          </aside>
          <article className="reading-content"><Suspense fallback={<p role="status">A carregar o conteúdo…</p>}><Outlet /></Suspense></article>
        </div>
      </> : <Suspense fallback={<p role="status">A carregar o conteúdo…</p>}><Outlet /></Suspense>}
    </main>
    <Footer />
  </div>;
}
