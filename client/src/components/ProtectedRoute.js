import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import AuthService from '../services/auth.service';

const ProtectedRoute = ({ children }) => {
	const [user, setUser] = useState(null);
	const navigate = useNavigate();
	useEffect(() => {
		console.log('protected route');
		const serviceUser = AuthService.getCurrentUser();
		setUser(serviceUser);
		if(serviceUser == null) {
			navigate("/");
		}
	}, [navigate]);
	
	return children;    
};

export default ProtectedRoute;