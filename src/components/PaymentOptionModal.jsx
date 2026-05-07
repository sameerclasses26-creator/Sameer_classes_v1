import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PaymentOptionModal({ course, onClose }) {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  if (!course) return null;

  const handleEMICheckout = () => {
    if (!token) {
      navigate("/login");
      return;
    }

    onClose();
    navigate(`/courses/${course._id}/payment`, {
      state: {
        course,
        paymentType: "emi",
      },
    });
  };

  const handleFullPayment = () => {
    if (!token) {
      navigate("/login");
      return;
    }

    onClose();
    navigate(`/courses/${course._id}/payment`, {
      state: {
        course,
        paymentType: "full",
      },
    });
  };

  const coursePrice = course.price || 0;
  const emiAmount = Math.round(coursePrice / 3);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-option-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <h2>Choose Payment Option</h2>
          <p>{course.title}</p>
        </div>

        <div className="payment-options-grid">
          {/* Full Payment Option */}
          <div className="payment-option-card">
            <div className="option-icon">💳</div>
            <h3>Full Payment</h3>
            <p className="option-price">₹{coursePrice}</p>
            <p className="option-desc">Pay complete amount now</p>
            <ul className="option-benefits">
              <li>✓ Admin reviews your payment</li>
              <li>✓ Get access after approval</li>
              <li>✓ No interest or extra charges</li>
            </ul>
            <button
              className="solid-button"
              onClick={handleFullPayment}
            >
              Pay Full Amount
            </button>
          </div>

          {/* EMI Option */}
          <div className="payment-option-card emi-card">
            <div className="option-icon">📅</div>
            <h3>Pay in EMI</h3>
            <p className="option-price">3 Installments</p>
            <div className="emi-breakdown">
              <div className="emi-item">
                <span className="emi-label">1st Payment</span>
                <span className="emi-amount">₹{emiAmount}</span>
              </div>
              <div className="emi-item">
                <span className="emi-label">2nd Payment (30 days)</span>
                <span className="emi-amount">₹{emiAmount}</span>
              </div>
              <div className="emi-item">
                <span className="emi-label">3rd Payment (60 days)</span>
                <span className="emi-amount">₹{coursePrice - emiAmount * 2}</span>
              </div>
            </div>
            <p className="emi-note">⚡ Get course access after 1st payment!</p>
            <button
              className="solid-button emi-button"
              onClick={handleEMICheckout}
            >
              Start EMI Plan
            </button>
          </div>
        </div>

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal-content {
            background: white;
            border-radius: 16px;
            max-width: 800px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
          }

          .payment-option-modal {
            padding: 24px;
          }

          .modal-close {
            position: absolute;
            top: 12px;
            right: 12px;
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #666;
            padding: 4px 8px;
            line-height: 1;
          }

          .modal-close:hover {
            color: #333;
          }

          .modal-header {
            text-align: center;
            margin-bottom: 24px;
          }

          .modal-header h2 {
            margin: 0 0 8px 0;
            color: #333;
            font-size: 24px;
          }

          .modal-header p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }

          .error-banner {
            background: #fee;
            border: 1px solid #fcc;
            color: #c33;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 14px;
          }

          .payment-options-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
          }

          .payment-option-card {
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
          }

          .payment-option-card:hover {
            border-color: #1d70b8;
            box-shadow: 0 4px 12px rgba(29, 112, 184, 0.1);
          }

          .payment-option-card.emi-card {
            border-color: #4caf50;
            background: rgba(76, 175, 80, 0.02);
          }

          .payment-option-card.emi-card:hover {
            border-color: #45a049;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
          }

          .option-icon {
            font-size: 40px;
            margin-bottom: 12px;
          }

          .payment-option-card h3 {
            margin: 0 0 8px 0;
            font-size: 20px;
            color: #333;
          }

          .option-price {
            font-size: 24px;
            font-weight: 700;
            color: #1d70b8;
            margin: 0 0 8px 0;
          }

          .payment-option-card.emi-card .option-price {
            color: #4caf50;
          }

          .option-desc {
            margin: 0 0 16px 0;
            color: #666;
            font-size: 14px;
          }

          .option-benefits {
            list-style: none;
            margin: 16px 0;
            padding: 0;
            text-align: left;
            flex-grow: 1;
          }

          .option-benefits li {
            padding: 6px 0;
            font-size: 13px;
            color: #555;
          }

          .emi-breakdown {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 12px;
            margin: 12px 0;
            text-align: left;
          }

          .emi-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
            font-size: 13px;
          }

          .emi-item:last-child {
            border-bottom: none;
          }

          .emi-label {
            color: #666;
          }

          .emi-amount {
            font-weight: 600;
            color: #4caf50;
          }

          .emi-note {
            background: #e8f5e9;
            color: #2e7d32;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            margin: 8px 0;
            font-weight: 500;
          }

          .solid-button {
            background: #1d70b8;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s ease;
            font-size: 14px;
            margin-top: auto;
          }

          .solid-button:hover:not(:disabled) {
            background: #1559a3;
          }

          .solid-button:disabled {
            background: #ccc;
            cursor: not-allowed;
          }

          .emi-button {
            background: #4caf50;
          }

          .emi-button:hover:not(:disabled) {
            background: #45a049;
          }

          @media (max-width: 600px) {
            .modal-content {
              width: 95%;
              padding: 20px 16px;
            }

            .payment-options-grid {
              grid-template-columns: 1fr;
            }

            .modal-header h2 {
              font-size: 20px;
            }

            .option-price {
              font-size: 20px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
