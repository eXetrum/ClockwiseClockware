import { useLocation, Navigate } from "react-router-dom"
import { isLoggedIn } from '../api/auth';

const RouteGuard = ({ children }) => {
	const location = useLocation();

	if(!isLoggedIn() && location.pathname !== '/login') {
		return <Navigate to='/login' state={{from: location}} />
	} else {	
		return children;
	}
};

export default RouteGuard;