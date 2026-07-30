import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export const PracticePage = () => {
    const navigate = useNavigate();
    useEffect(() => {
        // Redirect to the new PISA experience
        navigate('/pisa', { replace: true });
    }, [navigate]);
    return (_jsx("div", { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }, children: _jsx("p", { children: "Redirecting to PISA experience..." }) }));
};
