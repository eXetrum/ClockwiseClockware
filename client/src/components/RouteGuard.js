import { useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import { isLoggedIn } from '../api/auth';

const RouteGuard = ({ children }) => {
	const navigate = useNavigate();
	useEffect(() => {
		console.log('protected route');
		if(!isLoggedIn()) {
			navigate("/");
		}
	}, [navigate]);
	
	return children;    
};

export default RouteGuard;