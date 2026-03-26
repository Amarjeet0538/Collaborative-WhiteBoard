import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import LiquidWarp from '@/components/ui/background/LiquidWarp';
import DarkModeToggle from '@/components/DarkModeToggle';
import Logo from '@/components/Logo';
import { Github } from 'lucide-react';
import { Google } from '@boxicons/react';
import { useAuth } from '../hooks/useAuth.js';
import { authApi } from '../api/auth.api.js';

export default function Login() {
  const { login } = useAuth();
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  const onSubmit = async (data) => {
    try {
      const result = isSignUp
        ? await authApi.register(data.name, data.email, data.password)
        : await authApi.login(data.email, data.password);

      login(result.user, result.token);
      navigate('/home');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Something went wrong');
    }
  };

  const handleDemoLogin = async (email, password) => {
    try {
      const result = await authApi.login(email, password);
      login(result.user, result.token);
      navigate('/home');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="font-body grid grid-cols-2 h-screen">
      <div className="relative">
        <LiquidWarp
          speed={0.003}
          warpIntensity={1.5}
          warpFrequency={10}
          iterations={10}
          colorSpeed={0.1}
          colorOffsetR={0}
          colorOffsetG={2}
          colorOffsetB={4}
          brightness={0.5}
          saturation={0.5}
          zoom={1}
        />
      </div>
      <div className="relative min-h-screen flex flex-col font-body items-center justify-center bg-background-muted">
        <Logo />
        <div className="absolute right-2 top-2">
          <DarkModeToggle />
        </div>
        <div className="text-2xl mt-15 font-semibold p-2 text-foreground">
          {isSignUp ? 'Create your account' : 'Welcome Back'}
        </div>
        <div className="pb-8 text-md text-foreground-muted">
          {isSignUp
            ? 'Get Started with a free account'
            : 'Enter your email to sign in to your account'}
        </div>

        <div className="bg-background p-8 rounded-xl text-foreground shadow-sm border border-black/10 w-110">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              className="cursor-pointer bg-background shadow-sm hover:shadow-md border border-border-muted hover:border-border/60 rounded-md p-2 flex justify-center items-center gap-4 hover:bg-background-highlight text-md"
              onClick={() => {}}
            >
              <Google />
              Google
            </button>
            <button
              className="cursor-pointer bg-background shadow-sm hover:shadow-md border border-border-muted hover:border-border/90 rounded-md p-2 hover:bg-background-highlight flex justify-center items-center gap-4 text-md"
              onClick={() => {}}
            >
              <Github size={20} /> Github
            </button>
          </div>

          <div className="my-6 flex items-center">
            <div className="grow border border-border"></div>
            <span className="mx-2 shrink text-sm text-border">OR CONTINUE WITH</span>
            <div className="grow border border-border"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {isSignUp && (
              <div className="mb-4">
                <label className="block mb-2 text-sm">Full Name</label>
                <input
                  {...register('name')}
                  type="text"
                  required
                  className="border rounded-md p-3 w-full bg-background text-md border-border-muted focus:ring-1 focus:ring-border focus:outline-none"
                  placeholder="Maxwell Pandey"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block mb-2 text-sm">Email address</label>
              <input
                {...register('email')}
                type="email"
                required
                className="border rounded-md p-3 w-full bg-background text-md border-border-muted focus:ring-1 focus:ring-border focus:outline-none"
                placeholder="name@example.com"
              />
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm">Password</label>
              </div>
              <input
                {...register('password')}
                type="password"
                required
                className="border rounded-md p-3 w-full bg-background text-md border-border-muted focus:ring-1 focus:ring-border focus:outline-none"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="cursor-pointer bg-primary shadow-sm hover:bg-primary/70 border border-border-muted hover:border-border/60 rounded-md p-2 flex justify-center items-center gap-4 text-background text-md w-full"
            >
              {isSignUp ? 'Sign up' : 'Sign in'}
            </button>
          </form>

          <div className="flex gap-2">
            <button
              className="cursor-pointer bg-background hover:bg-background-muted shadow-sm border border-border-muted hover:border-border/60 rounded-md p-2 flex justify-center items-center gap-4 text-md w-full mt-4"
              onClick={() => handleDemoLogin('demo@demo.com', 'demo@123')}
            >
              Demo Account
            </button>
            <button
              className="cursor-pointer bg-background hover:bg-background-muted shadow-sm border border-border-muted hover:border-border/60 rounded-md p-2 flex justify-center items-center gap-4 text-md w-full mt-4"
              onClick={() => handleDemoLogin('demo2@demo.com', 'demo@123')}
            >
              Demo Account 2
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-foreground-muted">
          {isSignUp ? 'Already have an account?  ' : "Don't have an account?  "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="cursor-pointer text-primary hover:text-primary-hover"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}