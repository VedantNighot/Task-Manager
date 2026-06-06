import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext'
import Navbar from './Navbar';
import SideMenu from './SideMenu';
import ChatAssistant from '../ChatAssistant/ChatAssistant';

const DashboardLayout = ({children,activeMenu}) => {
    const {user} = useContext(UserContext);
  return (
    <div className="relative min-h-screen">                 
        <Navbar activeMenu={activeMenu}/>
        {user && (
            <div className="flex">
                <div className="max-[1080px]:hidden">
                    <SideMenu activeMenu={activeMenu}/>
                </div>
                <div className="grow mx-5 pb-16">{children}</div>
            </div>
        )}
        {user && <ChatAssistant />}
    </div>
  )
}

export default DashboardLayout;
