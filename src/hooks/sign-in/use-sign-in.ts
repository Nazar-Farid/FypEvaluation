import { useToast } from '@/components/ui/use-toast'
import { UserLoginProps, UserLoginSchema } from '@/schemas/auth.schema'
import { useSignIn } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export const useSignInForm = () => {
  const { isLoaded, setActive, signIn } = useSignIn()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const methods = useForm<UserLoginProps>({
    resolver: zodResolver(UserLoginSchema),
    mode: 'onChange',
  })

  const onHandleSubmit = methods.handleSubmit(async (values) => {
    if (!isLoaded) return

    setLoading(true)
    try {
      const authenticated = await signIn.create({
        identifier: values.email,
        password: values.password,
      })

      if (authenticated.status === 'complete' && authenticated.createdSessionId) {
        // Activate session immediately
        await setActive({ session: authenticated.createdSessionId })
        toast({
          title: 'Success',
          description: 'Welcome back!',
        })
        router.push('/dashboard')
      } else {
        toast({
          title: 'Error',
          description: 'Login not completed',
        })
        setLoading(false)
      }
    } catch (error: any) {
      setLoading(false)
      if (error?.errors?.[0]?.code === 'form_password_incorrect') {
        toast({
          title: 'Error',
          description: 'Email or password is incorrect. Please try again.',
        })
      } else {
        toast({
          title: 'Error',
          description: 'Something went wrong. Please try again later.',
        })
      }
    }
  })

  return {
    methods,
    onHandleSubmit,
    loading,
  }
}
