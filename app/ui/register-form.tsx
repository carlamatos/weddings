'use client';

import { lusitana } from '@/app/ui/fonts';
import {
  UserIcon,
  AtSymbolIcon,
  KeyIcon,
  PhoneIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useActionState } from 'react';
import { registerUser, RegisterState } from '@/app/lib/actions';
import Link from 'next/link';

export default function RegisterForm() {
  const initialState: RegisterState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded">
      <form action={formAction} className="space-y-3">
        <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
          <h1 className={`${lusitana.className} mb-3 text-2xl`}>
            Create an account
          </h1>

          {state.message && !state.errors && (
            <div className="flex items-center space-x-1 mb-4">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{state.message}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* First Name */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-900" htmlFor="given_name">
                First Name
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="given_name"
                  type="text"
                  name="given_name"
                  placeholder="First name"
                  required
                />
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
              {state.errors?.given_name && (
                <p className="mt-1 text-xs text-red-500">{state.errors.given_name[0]}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-900" htmlFor="family_name">
                Last Name
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="family_name"
                  type="text"
                  name="family_name"
                  placeholder="Last name"
                  required
                />
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
              {state.errors?.family_name && (
                <p className="mt-1 text-xs text-red-500">{state.errors.family_name[0]}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="mt-3">
            <label className="mb-2 block text-xs font-medium text-gray-900" htmlFor="phone">
              Phone <span className="text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="phone"
                type="tel"
                name="phone"
                placeholder="Enter phone number"
              />
              <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>

          {/* Email */}
          <div className="mt-3">
            <label className="mb-2 block text-xs font-medium text-gray-900" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            {state.errors?.email && (
              <p className="mt-1 text-xs text-red-500">{state.errors.email[0]}</p>
            )}
          </div>

          {/* Password */}
          <div className="mt-3">
            <label className="mb-2 block text-xs font-medium text-gray-900" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            {state.errors?.password && (
              <p className="mt-1 text-xs text-red-500">{state.errors.password[0]}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mt-3">
            <label className="mb-2 block text-xs font-medium text-gray-900" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            {state.errors?.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{state.errors.confirmPassword[0]}</p>
            )}
          </div>

          <Button className="mt-4 w-full" aria-disabled={isPending}>
            Create Account <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
          </Button>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
