import type { ButtonHTMLAttributes, ReactNode } from 'react'

type PKIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode
}

export function PKIconButton({ icon, className, type = 'button', ...props }: PKIconButtonProps) {
  return (
    <button
      className={[classes.button, className].filter(Boolean).join(' ')}
      type={type}
      {...props}
    >
      {icon}
    </button>
  )
}

const classes = {
  button:
    'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 [-webkit-tap-highlight-color:transparent]',
}
