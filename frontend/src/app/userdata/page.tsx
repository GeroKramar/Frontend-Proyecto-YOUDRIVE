'use client'
import SalePostCard from '@/components/DashboardComponents/PostUser';
import ReviewCard from '@/components/DashboardComponents/ReviewCard';
import Sidebar from '@/components/DashboardComponents/Sidebar'
import SkeletonDashboard from '@/components/sketelons/SkeletonDashboard';
import { IUserData } from '@/interfaces/IUser';
import { redirect, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const apiUrl = process.env.NEXT_PUBLIC_API_GET_USERS_TOKEN;
if (!apiUrl) {
  throw new Error('Environment variable NEXT_PUBLIC_API_GET_USERS_TOKEN is not set');
}

const UserProfile: React.FC = () => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<IUserData | null >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const userSession = localStorage.getItem("userSession");
      if (userSession) {
        const parsedSession = JSON.parse(userSession);
        setUserToken(parsedSession.token);  
      } else {
        setLoading(true)
        alert("Necesitas estar logueado para ingresar");
        redirect("/login")
      }
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error('Error fetching user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error:any) {
        throw new Error(error);
      } finally {
        setLoading(false);
      }
    };

    if (userToken) {
      fetchData();
    }
  }, [userToken]);
  if (loading) {
    return <SkeletonDashboard />;
  } 
  return (
        <>
        <div className='bg-[#313139] p-6'></div>
        <div className='bg-[#313139]'>

        <Sidebar/>
      <div className="max-w-6xl mx-auto rounded-xl">
        <div className="flex justify-center">
        <img
        src={userData?.image_url}
        alt="Profile"
        className="w-32 h-32 rounded-full"
        />
        </div>
        <div className="text-center mt-2">
          <h2 className="text-lg font-medium text-gray-100">{userData?.name}</h2>
          <p className="text-sm text-gray-300">Buenos Aires, Argentina</p>
        </div>
        <div className="px-6 py-4">
          <p className="text-gray-100 text-base">
            {userData?.aboutMe}
          </p>
        </div>
        <div className="px-6 py-4">
          <h3 className="text-lg font-medium text-gray-100">Reviews</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {userData?.reviews.map((review) => (
              <ReviewCard
              key={review.id}
              rating={review.rating}
              comment={review.comment}
              createdAt={review.created_at}
              />
             
            ))}
          </div>
        </div>
        <div className="px-6 py-4">
        <h3 className="text-lg font-medium text-gray-100">Sale Posts</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {userData?.post?.map((rent) => (
              
              <SalePostCard
              key={rent.id}
            productName={rent.title}
            productDescription={rent.description}
            price={rent.price}
            imageUrl={rent.car?.image_url[0]}
            />
            ))}
          
        </div>
      </div>
      </div>
    </div>
      </>
    );
  };
  
  export default UserProfile;
    
    
    

