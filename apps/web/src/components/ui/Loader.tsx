import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoaderProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    variant?: 'primary' | 'secondary' | 'white';
}

export default function Loader({
    className,
    size = 'md',
    text,
    variant = 'primary'
}: LoaderProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    const colorClasses = {
        primary: 'text-violet-600 dark:text-violet-400',
        secondary: 'text-zinc-500 dark:text-zinc-400',
        white: 'text-white'
    };

    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <Loader2 className={cn("animate-spin", sizeClasses[size], colorClasses[variant])} />
            {text && (
                <p className={cn(
                    "font-medium animate-pulse",
                    size === 'sm' ? "text-xs" : "text-sm",
                    variant === 'white' ? "text-white/80" : "text-zinc-500 dark:text-zinc-400"
                )}>
                    {text}
                </p>
            )}
        </div>
    );
}
