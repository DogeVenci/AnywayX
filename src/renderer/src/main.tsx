import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import Setting from './pages/setting';

import {
    createBrowserRouter,
    createHashRouter,
    RouterProvider,
} from "react-router-dom";

const router = createHashRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/setting",
        element: <Setting />
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)