import { cn } from '@/lib/utils';

export default function AuthCard({ title, children, className }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfbfb] to-[#ebedee]">
      <div
        className={cn(
          'w-full max-w-[450px] rounded-2xl border border-white/50 bg-white/90 p-10 shadow-xl backdrop-blur-[10px]',
          className
        )}
      >
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary">MinLish</h1>
          {title && <p className="mt-1 text-sm text-muted-foreground">{title}</p>}
        </div>
 
        {children}
      </div>
    </div>
  );
}