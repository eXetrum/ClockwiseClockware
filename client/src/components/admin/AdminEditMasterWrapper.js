import { useParams } from 'react-router-dom';

const AdminEditMasterWrapper = () => {
    const {id} = useParams();
    return <AdminEditMaster id={id} />;
};

export default AdminEditMasterWrapper;