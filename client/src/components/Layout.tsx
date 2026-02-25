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
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className={cn(
          'mt-16 p-6 transition-all duration-300 ease-in-out min-h-[calc(100vh-4rem)]',
          sidebarCollapsed ? 'ml-[60px]' : 'ml-[240px]'
        )}
      >
        {children}
      </main>
    </div>
  );
}
