import { Moon, Sun, Monitor, Palette } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { useTheme } from './theme-provider';
import type { ColorPreset } from './theme-provider';

const presets: { name: string; value: ColorPreset; color: string }[] = [
  { name: 'Violet', value: 'violet', color: '#7c3aed' },
  { name: 'Blue', value: 'blue', color: '#3b82f6' },
  { name: 'Green', value: 'green', color: '#10b981' },
  { name: 'Orange', value: 'orange', color: '#f59e0b' },
  { name: 'Rose', value: 'rose', color: '#f43f5e' },
  { name: 'Zinc', value: 'zinc', color: '#71717a' },
];

export function ThemeToggle() {
  const { theme, setTheme, colorPreset, setColorPreset } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Mode
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === 'light' && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === 'dark' && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
          {theme === 'system' && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Palette className="h-3 w-3" />
          Color
        </DropdownMenuLabel>
        <div className="px-2 py-1.5 flex items-center gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setColorPreset(preset.value)}
              className="h-6 w-6 rounded-full transition-all hover:scale-110 flex items-center justify-center"
              style={{ backgroundColor: preset.color }}
              title={preset.name}
            >
              {colorPreset === preset.value && (
                <span className="text-white text-[10px] font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
