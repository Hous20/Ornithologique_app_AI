import { Outlet } from "react-router-dom";
import Navigation from "./components/Navigation";

function Root() {
    return ( 
        <div className="Root">
            <Navigation />
            <Outlet />
        </div>
    );
}

export default Root;