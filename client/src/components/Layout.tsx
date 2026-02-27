import { useState } from 'react';
import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <div className="fixed top-14 left-0 z-40">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
        <main
          className={cn(
            'flex-1 transition-all duration-200 min-h-[calc(100vh-56px)]',
            sidebarCollapsed ? 'ml-[60px]' : 'ml-[240px]'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
