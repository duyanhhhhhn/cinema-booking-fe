'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isProfile = pathname.includes('/account/profile');
  const isChangePassword = pathname.includes('/account/change-password');

  const baseBtn =
    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-medium transition';

  const activeBtn =
    'bg-[#b91c1c] text-[#fee2e2] shadow-inner shadow-red-900/40';

  const inactiveBtn =
    'text-slate-200 hover:bg-[#dc2626] hover:text-[#fee2e2]';

  return (
    <aside className="w-full md:w-64 lg:w-72">
      <div className="flex h-full flex-col rounded-xl border border-[#3a2225] bg-[#1b0b0d] px-5 py-6 shadow-[0_18px_45px_rgba(0,0,0,0.75)]">

        {/* USER INFO */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-[#f5dba8] to-[#c2955b] text-sm font-semibold text-[#4a2b10]">
              NA
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight text-slate-100">
                Nguyễn Văn A
              </span>
              <button
                type="button"
                className="mt-1 w-max rounded-full bg-[#f97373] px-2.5 py-0.5 text-[11px] font-medium text-white"
              >
                Thay đổi ảnh
              </button>
            </div>
          </div>

          {/* NAV */}
          <nav className="mt-8 space-y-1 text-[13px]">
            {/* PROFILE */}
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className={`${baseBtn} ${
                isProfile ? activeBtn : inactiveBtn
              }`}
            >
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-red-900/80">
                <i className="ti ti-user text-[11px]" />
              </span>
              <span>Thông tin tài khoản</span>
            </button>

            {/* CHANGE PASSWORD */}
            <button
              type="button"
              onClick={() => router.push('/change-password')}
              className={`${baseBtn} ${
                isChangePassword ? activeBtn : inactiveBtn
              }`}
            >
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-red-900/80">
                <i className="ti ti-lock text-[11px]" />
              </span>
              <span>Thay đổi mật khẩu</span>
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
