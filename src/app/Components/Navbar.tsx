'use client'
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
    useUser,
} from "@clerk/nextjs"
import Sidebar from "./Sidebar"
import Link from "next/link"
import { useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { setSignIn } from "@/lib/slices/signedIn";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
const Navbar = () => {
    const { isSignedIn, user, isLoaded } = useUser();
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(setSignIn({
            isSignedIn: isSignedIn,
            isLoaded: isLoaded,
            username: user?.username || null,
            error: null
        }))
    }, [isSignedIn, isLoaded, user, dispatch]);
    return (
        <div className="border-b sticky top-0 bg-white z-50 w-full max-h-[80px]">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                draggable
                theme="light"

            />
            <div className={"flex justify-between items-center p-4 w-full   max-w-[1400px] mx-auto"}>
                <div className="flex gap-2 justify-start items-center">
                    <Sidebar />
                    <Link href={"/"} className={"text-2xl font-bold"}>CoderHub</Link>
                </div>
                <div className="flex gap-2 justify-end items-center text-sm">
                    <SignedOut>
                        <SignInButton >
                            <div className="sign-in">
                                <button>
                                    <span className="button_top"> Sign In </span>
                                </button>
                            </div>
                        </SignInButton>
                        <SignUpButton >
                            <div className="sign-up">
                                <button>
                                    <span className="button_top"> Sign up </span>
                                </button>
                            </div>
                        </SignUpButton >
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </div>
        </div>
    )
}

export default Navbar
