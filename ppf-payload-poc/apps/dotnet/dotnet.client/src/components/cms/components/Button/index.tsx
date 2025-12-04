import { CMSButtonProps } from '@ppf/payload-renderer'
import { type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { buttonVariants } from './variants'


export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {

}

const Button = React.forwardRef<HTMLButtonElement, CMSButtonProps & { className?: string }>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <button className={buttonVariants({ className, size, variant })} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { Button }
