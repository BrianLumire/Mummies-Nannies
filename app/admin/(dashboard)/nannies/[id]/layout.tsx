// app/layout.tsx

import Image from "next/image";

export default function SingleMummyLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="h-full mx-2 mb-4 ">
        {/*top section */}
        <div className="flex items-center mt-3 justify-between  mb-5 md:mb-3 ">
        <div className="">
          <div className="flex gap-2 items-center mb-1">
            <span className="text-[16px] font-barlow font-semibold">Sharon Wanjiku</span>
            <div className="rounded-lg py-[3px] flex items-center justify-center px-3 shadow-lg shadow-[#6000DA26] text-[9px] bg-[#6000DA26] text-[#6000DA] ">
              Available
            </div>
          </div>
          <div className="flex item-center">
          <span className="text-xs font-barlow">
            <span className="text-[#6000DA]">Home / Nannies</span> /Sharon Wanjiku
          </span>
          </div>
        </div>
        <button className="rounded-lg bg-[#6000DA26] px-2 py-2 flex items-center gap-2">
          <Image src="/nannies-assets/single-settings.svg" width={17} height={17} alt="" />
          <span className="font-barlow text-[#6000DA] font-semibold text-xs">Manage</span>
          <Image src="/nannies-assets/single-drop.svg" width={15} height={15} alt="" />
        </button>
        </div>

        {/*bottom section */}
        <div className="flex flex-col md:flex-row gap-2  w-full h-full">

            {/*sidebar */}
         <div className="border rounded-lg h-full shadow-md md:w-1/5">
         {/*profile container */}
         <div className="h-1/4  relative">
            <Image src="/nannies-assets/single-profile.svg" width={100} height={100} alt="" className="object-cover rounded-lg w-full h-full" />
          </div>
         {/*second part */}
         <div className="h-3/4 p-2 flex flex-col border-t bg-[#FAFAFA] ">
          <div className="flex flex-col border-b items-center justify-center gap-2 py-2">
            <p className="font-barlow text-base font-medium">Sharon Wanjiku</p>
            <div className="flex items-center gap-2">
            <Image src="/nannies-assets/single-location.svg" width={15} height={15} alt="" />
            <span className="font-barlow text-xs">Molo, Nakuru</span>
            <Image src="/nannies-assets/single-rating.svg" width={15} height={15} alt="" />
            <span className="font-barlow text-xs">4.5</span>
            </div>
          </div> 
          <div className="flex items-center gap-3 p-2 border-b">
            <Image src="/nannies-assets/single-work.svg" width={17} height={17} alt="" />
            <div className="flex flex-col gap-1">
              <span className="font-barlow text-xs text-gray-500">Work Terms</span>
              <span className="font-barlow font-semibold text-xs"> Fulltime</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 border-b">
            <Image src="/nannies-assets/single-phone.svg" width={17} height={17} alt="" />
            <div className="flex flex-col gap-1">
              <span className="font-barlow text-xs text-gray-500">Phone No</span>
              <span className="font-barlow font-semibold text-xs"> +254 73284789</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 border-b">
            <Image src="/nannies-assets/single-religion.svg" width={17} height={17} alt="" />
            <div className="flex flex-col gap-1">
              <span className="font-barlow text-xs text-gray-500">Religion</span>
              <span className="font-barlow font-semibold text-xs"> Christian</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 border-b">
            <Image src="/nannies-assets/single-tribe.svg" width={17} height={17} alt="" />
            <div className="flex flex-col gap-1">
              <span className="font-barlow text-xs text-gray-500">Tribe</span>
              <span className="font-barlow font-semibold text-xs"> Kikuyu</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 border-b">
            <Image src="/nannies-assets/single-nation.svg" width={17} height={17} alt="" />
            <div className="flex flex-col gap-1">
              <span className="font-barlow text-xs text-gray-500">Nationality</span>
              <span className="font-barlow font-semibold text-xs"> Kenyan</span>
            </div>
          </div>
            <div className="flex items-center gap-3 p-2 border-b">
            <Image src="/nannies-assets/single-salary.svg" width={17} height={17} alt="" />
            <div className="flex flex-col gap-1">
              <span className="font-barlow text-xs text-gray-500">Salary Range</span>
              <span className="font-barlow font-semibold text-xs"> 16k-20k</span>
            </div>
          </div>
         </div>
         </div>

         {/*main content */}
         <div className=" md:w-4/5">
         {children}
         </div>
        
        </div>
       
      </div>
    );
  }