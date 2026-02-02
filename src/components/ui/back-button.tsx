import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  label?: string;
  to?: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
}

export const BackButton = ({
  label = 'Back',
  to,
  className,
  variant = 'ghost'
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      className={cn("flex items-center gap-2", className)}
      aria-label={label}
    >
      <ArrowLeft size={18} />
      <span>{label}</span>
    </Button>
  );
};
