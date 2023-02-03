import { useParams } from 'react-router-dom';
import AdminEditCity from './AdminEditCity';

const AdminEditCityWrapper = () => {
    const {id} = useParams();
    return <AdminEditCity id={id} />;
};

export default AdminEditCityWrapper;