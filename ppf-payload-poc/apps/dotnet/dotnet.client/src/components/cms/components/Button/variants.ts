import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  'btn',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        clear: '',
        default: '',
        icon: '',
        md: 'btn-md',
        lg: 'btn-lg',
        sm: 'btn-sm',
      },
      variant: {
        default: 'bg-primary',
        destructive: 'bg-error',
        ghost: 'btn-ghost',
        link: 'btn-link',
        outline: 'btn-outline',
        secondary: 'bg-secondary',
      },
    },
  },
)