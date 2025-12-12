import { PageProps as InertiaPageProps } from '@inertiajs/core'

declare module '@inertiajs/core' {
  interface PageProps extends InertiaPageProps {
    // Define your global shared props
    auth: {
      user: User | null
    }
    errors: Record<string, string>
    flash: {
      message?: string
    }
  }
}