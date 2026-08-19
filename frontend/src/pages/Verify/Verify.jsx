import { useEffect } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../utils/api';
import { toast } from "react-toastify";

const Verify = () => {
    const [searchParams] = useSearchParams();
    const orderId=searchParams.get("orderId");
    const navigate= useNavigate();

    const verifyPayment=async()=>{
        // Read directly from localStorage: StoreContext's token state loads
        // asynchronously and may not be populated yet on this redirect landing.
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login to verify your order");
            navigate("/");
            return;
        }
        try {
            const response= await api.post("/api/order/verify",{orderId});
            if(response.data.success){
                navigate("/myorders");
                toast.success("Order Placed Successfully");
            }else{
                toast.error("Payment was not completed");
                navigate("/");
            }
        } catch (error) {
            navigate("/");
        }
    }
    useEffect(()=>{
        verifyPayment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
  return (
    <div className='verify'>
        <div className="spinner"></div>
        <p className="verify-text">Confirming your payment...</p>
    </div>
  )
}

export default Verify
