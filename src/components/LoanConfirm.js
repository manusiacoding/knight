import React, { useState } from "react";

export default function LoanConfirm() {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
}