'use client'
import React, { useEffect, useState } from 'react'
import Loader from '../Components/Loader'
import { redirect } from 'next/navigation'
import { useGetHandlesQuery, useUpdateHandlesMutation } from '@/lib/requests/profileData'
import { useAppSelector } from '@/lib/hooks'
import { toast } from 'react-toastify'

const Page = () => {
    const { data: userData, error, isLoading } = useGetHandlesQuery({});
    const { isSignedIn, isLoaded } = useAppSelector((state: any) => state.signedIn);
    const [leetcodeUsername, setLeetcodeUsername] = useState('');
    const [codeforcesUsername, setCodeforcesUsername] = useState('');
    const [codechefUsername, setCodechefUsername] = useState('');
    const [gfgUsername, setGfgUsername] = useState('');
    const [updateHandles, { data: updateData, error: updateError, isLoading: isUpdating }] = useUpdateHandlesMutation();

    const handleSubmit = () => {
        const data = {
            leetcode: leetcodeUsername,
            codeforces: codeforcesUsername,
            codechef: codechefUsername,
            gfg: gfgUsername
        };
        updateHandles(data);
    };

    useEffect(() => {
        if (userData && userData.length > 0) {
            setLeetcodeUsername(userData[0].leetcode || '');
            setCodeforcesUsername(userData[0].codeforces || '');
            setCodechefUsername(userData[0].codechef || '');
            setGfgUsername(userData[0].gfg || '');
        }
    }, [userData]);

    useEffect(() => {
        if (updateData && !updateError) {
            toast.success('Profile updated successfully!');
        }
    }, [updateData, updateError]);

    if (!isLoaded) return <><Loader /></>;
    if (!isSignedIn) {
        redirect('/sign-in');
    }
    if (isLoading) return <><Loader /></>;
    if (error || updateError) return <div className='w-full flex justify-center items-center h-screen bg-white'>Error: {('Something Went wrong')}</div>;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 relative">
            {/* Floating loader */}
            {isUpdating && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
                    <Loader />
                </div>
            )}
            <div className="w-full max-w-md mx-auto bg-white p-4 relative z-10">
                <h1 className="text-3xl font-bold text-gray-900">Edit your profile</h1>
                <p className="mt-1 text-sm text-gray-600">
                    This information will be displayed publicly so be careful what you share.
                </p>
                <div className='flex flex-col space-y-4 mt-4'>
                    <label htmlFor="leetcodeUsername">LeetCode Username</label>
                    <div className="input-container w-full">
                        <input type="text" id="leetcodeUsername" className="input" placeholder="LeetCode Username" onChange={(e) => setLeetcodeUsername(e.target.value)} value={leetcodeUsername || ''} autoComplete='off' />
                    </div>
                    <label htmlFor="codeforcesUsername">Codeforces Username</label>
                    <div className="input-container w-full">
                        <input type="text" id="codeforcesUsername" className="input" placeholder="Codeforces Username" onChange={(e) => setCodeforcesUsername(e.target.value)} value={codeforcesUsername || ''} autoComplete='off' />
                    </div>
                    <label htmlFor="codechefUsername">CodeChef Username</label>
                    <div className="input-container w-full">
                        <input type="text" id="codechefUsername" className="input" placeholder="codechef Username" onChange={(e) => setCodechefUsername(e.target.value)} value={codechefUsername || ''} autoComplete='off' />
                    </div>
                    <label htmlFor="gfgUsername">GeeksForGeeks Username</label>
                    <div className="input-container w-full">
                        <input type="text" id="gfgUsername" className="input" placeholder="GeeksforGeeks Username" onChange={(e) => setGfgUsername(e.target.value)} value={gfgUsername || ''} autoComplete='off' />
                    </div>
                    <div className="flex justify-center">
                        <button onClick={handleSubmit}>
                            <span className="button_top"> Save Changes </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page