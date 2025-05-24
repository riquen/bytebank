interface LoaderProps {
  size?: 'sm' | 'lg'
  color?: 'background' | 'foreground'
}

export const Loader = ({ size = 'lg', color = 'foreground' }: LoaderProps) => {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div
        className={`${size === 'lg' ? 'w-12 h-12' : 'w-6 h-6'} text-${color} rounded-full border-4 border-t-transparent animate-spin`}
      ></div>
    </div>
  )
}
