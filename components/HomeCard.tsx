'use client'

import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react'

type HomeCardProps = {
    title: string,
    description: string,
    bg_class?: string,
    icon_src: string,
    onClick: () => void;
}

const HomeCard = ({
    title,
    description,
    bg_class,
    icon_src,
    onClick
}: HomeCardProps) => {
    return (
        <div
            className={cn("bg-orange-1 px-4 py-6 flex flex-col justify-between w-full xl:max-w-[270px] min-h-[260px] rounded-[14px] cursor-pointer", bg_class)}
            onClick={onClick}
        >
            <div className="flex-center glassmorphism size-12 rounded-[10px]">
                <Image src={icon_src} alt="meeting" width={27} height={27} />
            </div>
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-lg font-normal">{description}</p>
            </div>
        </div>
    )
}

export default HomeCard