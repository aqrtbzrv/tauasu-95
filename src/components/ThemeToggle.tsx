
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="transition-all duration-200"
    >
      {theme === 'light' ? (
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-200" />
      ) : (
        <Moon className="h-5 w-5 rotate-0 scale-100 transition-all duration-200" />
      )}
    </Button>
  );
};

export default ThemeToggle;
