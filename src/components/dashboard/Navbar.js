"use client";

import { SearchIcon, NotificationIcon } from "./DashboardIcons";

export default function Navbar({ title, sessionUser }) {
  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-slate-500 lg:flex w-72">
          <SearchIcon />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent text-sm outline-none w-full"
          />
          <kbd className="hidden rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:inline-block border">⌘K</kbd>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
            <NotificationIcon />
            <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          <div className="h-8 w-px bg-slate-200"></div>

          <button className="flex items-center gap-3 rounded-xl p-1 pr-3 transition-colors hover:bg-slate-100 text-left">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase">
              {sessionUser?.name?.[0] || "U"}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-none">{sessionUser?.name || "User"}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-none">{sessionUser?.role || "Admin"}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
