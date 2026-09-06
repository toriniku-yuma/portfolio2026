import AppLink from './AppLink';
import { Asterisk, ArrowDownRight, Plus } from 'lucide-react';

export default function Header() {
  return (
    <header className="mb-8 border-b border-solid border-line" id="top" tabIndex={-1}>
      <div className="animate-[page-enter_700ms_ease-out_both] flex justify-between items-center border-b border-solid border-line py-6">
        <AppLink
          className="inline-flex items-center gap-3 text-sm font-semibold"
          href="#"
        >
          <Asterisk size={26} aria-hidden="true" /> KS / PORTFOLIO
        </AppLink>
        <span className="font-mono text-muted text-[10px] tracking-[.12em]">
          PERSONAL ARCHIVE
        </span>
      </div>
      <div className="relative py-8 md:py-12 overflow-hidden">
        <p className="animate-page-enter [animation-delay:80ms] text-accent font-mono text-[11px] tracking-[.18em] mb-8 flex items-center gap-3">
          <ArrowDownRight size={18} aria-hidden="true" /> IDEAS, WORK &amp; EVERYTHING
          BETWEEN
        </p>
        <h1 className="animate-page-enter [animation-delay:160ms] relative z-1 text-[clamp(42px,_10vw,_76px)] lg:text-[clamp(76px,_7.8vw,_112px)] tracking-[-.055em] font-medium leading-[1.04]">
          Kawakami <span className="block text-accent">Shunki</span>
        </h1>
        <p className="animate-page-enter [animation-delay:240ms] text-lg md:text-2xl font-normal tracking-[.24em] mt-6">
          川上駿季
        </p>
        <p className="animate-page-enter [animation-delay:320ms] text-muted text-sm mt-8">
          つくる、考える、その記録。
          <br />
          これまでの歩みと、手を動かして生まれたもの。
        </p>
        <div
          className="hero-art isolate relative md:absolute md:right-[3%] md:top-[26%] w-[220px] md:w-[280px] h-[220px] mt-8 md:mt-0 ml-auto md:ml-0 flex flex-col justify-center gap-8"
          data-decoration
        >
          <Plus
            aria-hidden="true"
            className="absolute left-3 top-0 text-muted"
            size={12}
          />
          <div className="flex items-center justify-between gap-5" aria-hidden="true">
            <span className="font-mono text-[76px] leading-[1] text-line font-light">
              [
            </span>
            <svg
              className="w-[100px] h-[100px] text-accent animate-asterisk-turn"
              viewBox="0 0 100 100"
              fill="none"
            >
              <path
                d="M50 3v94M3 50h94M17 17l66 66M17 83l66-66"
                stroke="currentColor"
                strokeWidth="5"
              />
            </svg>
            <span className="font-mono text-[76px] leading-[1] text-line font-light">
              ]
            </span>
          </div>
          <span className="font-mono text-[9px] tracking-[.2em] text-center text-muted">
            THINK. BUILD. REPEAT.
          </span>
        </div>
      </div>
    </header>
  );
}
