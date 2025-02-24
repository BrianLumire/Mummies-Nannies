"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { createClient } from "@/supabase/client";
import Image from 'next/image';

// Define the schema for form validation
const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

const AdminSignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    try {
      const client = createClient();
      const { data: signInData, error } = await client.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      // Successful sign in
      toast.success("Sign in successful!");
      router.push("/admin/nannies");
    } catch (err) {
      console.error("Sign in error:", err);
      toast.error("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/admin/login/recover-password'); // Navigate to /recover-password
  };

  return (
    <div className="h-screen flex">
      {/* Left side */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-[#FAFAFA]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#FFFFFF] flex flex-col px-6 py-7 md:w-[40%] w-[80%] sm:w-[60%] shadow-md border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-300"
        >
          <motion.div 
            className="flex mb-5 flex-col items-center"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <img src="/admin-assets/nanies-icon.svg" alt="" className="w-[45px] h-[45px] hover:scale-105 transition-transform duration-200" />
            <span className='mb-4 font-medium text-[#6000DA] font-lemon text-lg hover:text-[#4a00ae] transition-colors duration-200'>
              Nannies
            </span>
            <span className='font-medium text-base font-sans'>Sign In</span>
          </motion.div>
          <form onSubmit={handleSubmit(onSubmit)} className="mb-14  flex flex-col">
            <input 
              type="email" 
              placeholder="Email" 
              {...register('email')}
              className="w-full px-2 py-2 mb-4 border text-sm border-gray-300 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-[#6000DA] 
                hover:border-[#6000DA] transition-all duration-200
                placeholder:text-gray-400" 
            />
            {errors.email && <span className="text-red-500 text-xs mb-2">{errors.email.message}</span>}
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                {...register('password')}
                className="w-full px-2 py-2 border text-sm border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-[#6000DA]
                  hover:border-[#6000DA] transition-all duration-200
                  placeholder:text-gray-400" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? (
                  <Image
                    src="/admin-assets/invisible.png"
                    alt="Hide password"
                    width={20}
                    height={20}
                  />
                ) : (
                  <Image
                    src="/admin-assets/View-password.svg"
                    alt="Show password"
                    width={20}
                    height={20}
                  />
                )}
              </button>
            </div>
            {errors.password && <span className="text-red-500 text-xs mb-2">{errors.password.message}</span>}
            <button 
              type="button"
              onClick={handleForgotPassword}
              className='text-xs flex justify-end mb-12 font-sans text-[#6000DA] mt-2 hover:text-[#4a00ae] hover:underline transition-colors duration-200'
            >
              Forgot Password ?
            </button>
            <button 
              className='px-9 py-2 mb-9 w-full text-white font-sans text-sm rounded-lg bg-[#6000DA] 
                relative overflow-hidden group hover:bg-[#4a00ae] active:bg-[#3a0088] 
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"/>
              ) : (
                <>
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-200"/>
                </>
              )}
            </button>
          </form>
          <div className="flex flex-col items-center">
            <span className='text-[#909090] pb-3 font-sans text-xs'>© 2025 | Copyright - Nannies</span>
          </div>
        </motion.div>
      </div>

      {/* Right side */}
      <div className="w-1/2 bg-[url('/admin-assets/bg-pic.svg')] bg-cover bg-center hidden md:block relative">
        <div className="absolute flex flex-col items-center justify-center inset-0 bg-gradient-to-r from-[#440397] to-[#1A013A63] opacity-60">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col w-[80%]"
          >
            <p className='font-barlow text-2xl text-white font-semibold mx-3 max-w-[270px]'>Manage all Operations in One Place</p>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-end mx-3 mb-3"
            >
              <div className="rounded-lg p-2 gap-2 flex items-center bg-[#ffffffda] hover:bg-white transition-colors duration-200">
                <img src="/admin-assets/profile1.svg" alt="" className="object-cover w-8 h-8 rounded-full"/>
                <div className="flex flex-col gap-1">
                  <p className='text-xs font-sans'>I.am Wangari</p>
                  <span className='text-[10px]'>Online</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-2 items-center mx-3 mb-3"
            >
              <div className="bg-[#ffffffda] w-1/2 rounded-lg p-3 gap-2 flex items-center hover:bg-white transition-colors duration-200">
                <img src="/admin-assets/document.svg" alt="" className="object-cover w-8 h-8 p-1 bg-[#6000DA12] rounded-lg"/>
                <div className="flex flex-col gap-1">
                  <p className='text-xs font-sans font-semibold'>+ 34</p>
                  <span className='text-[10px]'>Hired Nannies</span>
                </div>
              </div>
              <div className="bg-[#ffffffda] w-1/2 rounded-lg p-3 gap-2 flex items-center hover:bg-white transition-colors duration-200">
                <img src="/admin-assets/onboard.svg" alt="" className="object-cover w-8 h-8 p-1 bg-[#6000DA12] rounded-lg"/>
                <div className="flex flex-col gap-1">
                  <p className='text-xs font-sans font-semibold'>+ 42</p>
                  <span className='text-[10px]'>Nannies Onboarded</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center justify-center"
            >
              <div className="bg-[#ffffffda] w-[65%] rounded-lg p-2 gap-2 flex flex-col hover:bg-white transition-colors duration-200">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <img src="/admin-assets/profile2.svg" alt="" className="object-cover w-8 h-8 rounded-full"/>
                    <div className="flex flex-col gap-1">
                      <p className='text-xs font-sans font-semibold'>Sharon Wanjiku</p>
                      <span className='text-[10px]'>Received 32 min ago</span>
                    </div>
                  </div>
                  <button className="border border-[#6000DA] flex items-center rounded-lg px-6 py-[3px] hover:bg-[#6000DA] hover:text-white transition-all duration-200">
                    <span className='text-[#6000DA] text-xs hover:text-inherit'>Accept</span>
                  </button>
                </div>
                <div className="flex flex-col gap-1 pl-10">
                  <p className='text-xs font-sans font-semibold'>Salary offer: Ksh 15,000</p>
                  <span className='text-[10px]'>That is the best I can do.</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
    </div>
  );
};

export default AdminSignInPage;