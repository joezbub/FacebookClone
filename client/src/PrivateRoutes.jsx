import {Outlet, Navigate} from 'react-router-dom'

const PrivateRoutes = () => {
    const username = localStorage.getItem('username')
    return (
        username ? <Outlet/> : <Navigate to="/"/>
    )
}

export default PrivateRoutes