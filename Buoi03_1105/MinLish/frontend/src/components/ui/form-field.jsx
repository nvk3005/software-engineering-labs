import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Label } from './label';

const FormField = React.forwardRef(({ id, label, error, className, ...rest }, ref) => {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        ref={ref}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={!!error}
        className={cn(error && 'border-destructive focus-visible:ring-destructive')}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;