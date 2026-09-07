import AppLink from './components/AppLink';
import { ArrowUp } from 'lucide-react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Timeline from './components/Timeline';
import RelatedLinks from './components/RelatedLinks';
import { related } from './content/data';
import { renderLink } from './components/render';

export default function App() {
  return (
    <div className="max-w-[1480px] mx-auto px-6 md:px-10 xl:px-16">
      <AppLink
        className="fixed top-2 left-2 z-10 bg-accent text-canvas p-3 -translate-y-[160%] focus:translate-y-0"
        href="#main"
      >
        本文へ移動
      </AppLink>
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-[190px_minmax(0,_1fr)] xl:grid-cols-[190px_minmax(0,_1fr)_180px] gap-10 lg:gap-12 items-start pb-24">
        <Navigation />
        <main className="min-w-0" id="main" tabIndex={-1}>
          <Timeline />
        </main>
        <RelatedLinks />
      </div>
      <footer className="flex flex-wrap justify-between gap-5 border-t border-solid border-line py-8 text-muted text-xs">
        <section className="w-full xl:hidden print:hidden" aria-label="外部リンク">
          <h2 className="text-xs tracking-widest mb-3">外部リンク</h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">{related.map(renderLink)}</ul>
        </section>
        <span>Kawakami Shunki / 川上駿季</span>
        <span>つくる、考える、その記録。</span>
        <AppLink className="inline-flex items-center gap-2" href="#">
          ページの先頭へ <ArrowUp size={16} aria-hidden="true" />
        </AppLink>
      </footer>
    </div>
  );
}
