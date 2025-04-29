interface BannerProps {
  title: string
  subtitle?: string
  className?: string
}

const Banner = ({ title, subtitle, className = "" }: BannerProps) => {
  return (
    <div className={`py-8 px-4 md:px-6 ${className}`}>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
      </div>
    </div>
  )
}

export default Banner

