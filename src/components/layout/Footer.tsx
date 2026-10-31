import { Link } from 'react-router-dom';
import { LogoMark } from './Logo';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-6 w-6 opacity-80" />
          <span>3D Code World — learn to code by exploring.</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link className="hover:text-slate-300" to="/courses">Courses</Link>
          <Link className="hover:text-slate-300" to="/world">World</Link>
          <Link className="hover:text-slate-300" to="/leaderboard">Leaderboard</Link>
          <Link className="hover:text-slate-300" to="/settings">Accessibility & settings</Link>
        </nav>
      </div>
    </footer>
  );
}
