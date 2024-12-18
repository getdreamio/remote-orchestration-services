import { LogOut, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function UserMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent"
            >
                <User className="h-5 w-5" />
                <span>John Doe</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-[#1e293b] dark:bg-[#1e293b] shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                        <button
                            onClick={() => {
                                // Handle logout
                                setIsOpen(false);
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-[#334155]"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
