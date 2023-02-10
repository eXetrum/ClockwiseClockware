import {
    Modal, Button, Spinner
} from 'react-bootstrap';

const ModalBox = ({title='', body='', footer='', ...props}) => {
    return (
    <Modal
        {...props}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        animation={true}
    >
        <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{body}</Modal.Body>
        <Modal.Footer>{footer}</Modal.Footer>
    </Modal>
    );
};

export default ModalBox;