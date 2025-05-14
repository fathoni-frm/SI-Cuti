import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import SidebarAdmin from "../components/SidebarAdmin";
import SidebarAtasan from "../components/SidebarAtasan";
import SidebarPegawai from "../components/SidebarPegawai";

const MainLayout = ({ children, role }) => {
  const location = useLocation();

  const renderSidebar = () => {
    switch (role?.toLowerCase()) {
      case "admin":
        return <SidebarAdmin />;
      case "atasan":
        return <SidebarAtasan />;
      case "pegawai":
        return <SidebarPegawai />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar role={role} />
      <div className="flex flex-grow">
        {renderSidebar()}
        <div className="flex-grow overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
