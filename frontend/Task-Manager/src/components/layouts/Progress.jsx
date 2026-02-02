import React from 'react'
import { HiArrowLeftCircle } from "react-icons/hi2";

const Progress = ({ progress, status }) => {
    const getColor = () => {
        switch (status) {
            case 'In Progress':
                return 'bg-cyan-500';
            case 'Completed':
                return 'bg-lime-500';
            default:
                return 'bg-violet-500';
        }
    }
}
return (
    <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
            className={`${getColor()} h-1.5 rounded-full text-center text-xs font-medium `} style={{ width: `${progress}%` }}>
        </div>
    </div>
)
}

export default Progress;
