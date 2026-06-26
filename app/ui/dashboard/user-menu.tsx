'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function UserMenu({ name, isPaid }: { name: string; isPaid: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  async function handleCancelSubscription() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="dash-user dash-user--btn"
      >
        <UserCircleIcon />
        <span>{name}</span>
      </button>

      {open && (
        <div className="dash-user-menu">
          {isPaid && (
            <button
              onClick={handleCancelSubscription}
              disabled={loading}
              className="dash-user-menu-item dash-user-menu-item--danger"
            >
              {loading ? 'Redirecting…' : 'Cancel Subscription'}
            </button>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="dash-user-menu-item"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
