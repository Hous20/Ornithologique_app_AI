import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import Home from "./pages/Home";
import DetailsOiseau from "./pages/DetailsOiseau";
import AjoutOiseau from "./pages/AjoutOiseau";
import TableauComparatif from "./pages/TableauOiseaux";
import AjoutImage from "./pages/AjoutImage";

const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        children: [
            {index: true, Component: Home },
            {path: "Oiseau", Component: DetailsOiseau},
            {path: "add-species", Component: AjoutOiseau},
            {path: "table", Component: TableauComparatif},
            {path: "add-image", Component: AjoutImage},
        ]
    }
]);

export default router;
