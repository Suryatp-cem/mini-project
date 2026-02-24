"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full flex justify-center">
      <div className="bg-gradient-to-br from-card-start to-card-end p-10 rounded-xl w-[550px] text-center text-white shadow-[0_15px_35px_rgba(0,0,0,0.3)]">
        <h1 className="text-3xl font-bold mb-2">🎓 College Leave Management</h1>
        <p className="text-lg opacity-90">Please select your role</p>

        <div className="flex justify-between mt-[30px] gap-[15px]">
          <Link
            href="/sign-in?role=student"
            className="bg-white p-[25px] w-[150px] rounded-xl text-black no-underline transition-all duration-300 hover:-translate-y-[10px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex flex-col items-center"
          >
            <div className="text-[45px] mb-2">👨‍🎓</div>
            <h2 className="text-xl font-semibold">Student</h2>
          </Link>

          <Link
            href="/sign-in?role=faculty"
            className="bg-white p-[25px] w-[150px] rounded-xl text-black no-underline transition-all duration-300 hover:-translate-y-[10px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex flex-col items-center"
          >
            <div className="text-[45px] mb-2">👩‍🏫</div>
            <h2 className="text-xl font-semibold">Faculty</h2>
          </Link>

          <Link
            href="/sign-in?role=admin"
            className="bg-white p-[25px] w-[150px] rounded-xl text-black no-underline transition-all duration-300 hover:-translate-y-[10px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex flex-col items-center"
          >
            <div className="text-[45px] mb-2">👨‍💼</div>
            <h2 className="text-xl font-semibold">Admin</h2>
          </Link>
        </div>
      </div>
    </div>
  );
};