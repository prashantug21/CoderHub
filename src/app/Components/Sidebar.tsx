'use client'
import Link from 'next/link'
import React from 'react'
import { UserPen, UserPlus, UserSearch } from 'lucide-react'
import Loader from './Loader'
import { useSelector } from 'react-redux'
import { useAppSelector } from '@/lib/hooks'

const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const { isSignedIn, username, isLoaded } = useAppSelector((state: any) => state.signedIn);
  
  return (
    <div className='flex flex-col gap-16 relative'>
      <button
        className={`group flex items-center justify-center relative z-10 [transition:all_0.5s_ease] rounded-lg p-1 border-solid  cursor-pointer border-1 bg-[white] border-[#000000] outline-none focus-visible:outline-0`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className='bg-white rounded-lg'>
          <svg
            fill="currentColor"
            stroke="none"
            strokeWidth="0"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={`w-7 h-7 overflow-visible [transition:transform_.35s_ease]  group-hover:[transition-delay:.25s] [&amp;_path]:[transition:transform_.35s_ease] group-hover:rotate-45`}
          >
            <path
              className={`${isOpen ? "[transform:rotate(112.5deg)_translate(-27.2%,-80.2%)]" : ""}`}
              d="m3.45,8.83c-.39,0-.76-.23-.92-.62-.21-.51.03-1.1.54-1.31L14.71,2.08c.51-.21,1.1.03,1.31.54.21.51-.03,1.1-.54,1.31L3.84,8.75c-.13.05-.25.08-.38.08Z"
            ></path>
            <path
              className={`${isOpen ? "[transform:rotate(22.5deg)_translate(15.5%,-23%)]" : ""}`}
              d="m2.02,17.13c-.39,0-.76-.23-.92-.62-.21-.51.03-1.1.54-1.31L21.6,6.94c.51-.21,1.1.03,1.31.54.21.51-.03,1.1-.54,1.31L2.4,17.06c-.13.05-.25.08-.38.08Z"
            ></path>
            <path
              className={`${isOpen ? "[transform:rotate(112.5deg)_translate(-15%,-149.5%)]" : ""}`}
              d="m8.91,21.99c-.39,0-.76-.23-.92-.62-.21-.51.03-1.1.54-1.31l11.64-4.82c.51-.21,1.1.03,1.31.54.21.51-.03,1.1-.54,1.31l-11.64,4.82c-.13.05-.25.08-.38.08Z"
            ></path>
          </svg>
        </span>
      </button>
      <div className={`flex flex-col gap-4 
          absolute top-16 left-[] 
          bg-white p-4 rounded-lg 
          shadow-[8px_8px_0px_0px_rgba(0,0,0)] 
          border-black border-solid border-2
          transition-all duration-300 ease-in-out
          items-start
          ${isOpen
          ? 'opacity-100 translate-y-0 h-auto'
          : 'opacity-0 -translate-y-4 h-0  p-0 overflow-hidden pointer-events-none'
        }`}>
        {isSignedIn && <Link href={`/profile/${username}`} className="text-2xl font-bold flex gap-2 justify-center items-center group transition-all duration-300 hover:-translate-y-[2px]">
          <div className=" rounded-lg p-1 border-solid cursor-pointer border-[2.5px] bg-white border-black outline-none focus-visible:outline-0 w-fit transition-all duration-300 group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0)] ">
            <UserSearch className="w-7 h-7" />
          </div>
          <span className=" whitespace-nowrap flex items-center transition-all duration-300 group-hover:[text-shadow:1px_1px_1px_0px_rgba(0,0,0)]">
            Dashboard
          </span>
        </Link>}
        <Link href="/search" className="text-2xl font-bold flex gap-2 justify-center items-center group transition-all duration-300 hover:-translate-y-[2px]">
          <div className=" rounded-lg p-1 border-solid cursor-pointer border-[2.5px] bg-white border-black outline-none focus-visible:outline-0 w-fit transition-all duration-300 group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0)] ">
            <UserSearch className="w-7 h-7" />
          </div>
          <span className=" whitespace-nowrap flex items-center transition-all duration-300 group-hover:[text-shadow:1px_1px_1px_0px_rgba(0,0,0)]">
            Search
          </span>
        </Link>
        {isSignedIn && <Link href="/edit" className="text-2xl font-bold flex gap-2 justify-center items-center group transition-all duration-300 hover:-translate-y-[2px]">
          <div className=" rounded-lg p-1 border-solid cursor-pointer border-[2.5px] bg-white border-black outline-none focus-visible:outline-0 w-fit transition-all duration-300 group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0)] ">
            <UserPen className="w-7 h-7" />
          </div>
          <span className=" whitespace-nowrap flex items-center transition-all duration-300 group-hover:[text-shadow:1px_1px_1px_0px_rgba(0,0,0)]">
            Edit Profile
          </span>
        </Link>}
        {isSignedIn && <Link href="/friends" className="text-2xl font-bold flex gap-2 justify-center items-center group transition-all duration-300 hover:-translate-y-[2px]">
          <div className=" rounded-lg p-1 border-solid cursor-pointer border-[2.5px] bg-white border-black outline-none focus-visible:outline-0 w-fit transition-all duration-300 group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0)] ">
            <UserPlus className="w-7 h-7" />
          </div>
          <span className=" whitespace-nowrap flex items-center transition-all duration-300 group-hover:[text-shadow:1px_1px_1px_0px_rgba(0,0,0)]">
            Friends
          </span>
        </Link>}
      </div>
    </div>
  )
}

export default Sidebar
