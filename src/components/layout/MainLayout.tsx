import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function MainLayout() {
    return (
        <div>
            <Navbar />

            <main
                className={
                    "bg-background w-full flex flex-col items-center mb-20"
                }
            >
                <div className="w-full max-w-[1280px]">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
