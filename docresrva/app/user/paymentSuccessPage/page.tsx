'use client';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

const PaymentSuccessPageContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const txnid = searchParams.get('transactionId');
    const amount = searchParams.get('amountPaid');
    const bankRefNum = searchParams.get('bankRefNum');

    const handleOnclick = () => {
        router.push(`/user/userHome`);
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-teal-400 to-blue-500">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-96 text-center transform transition-transform duration-300 hover:scale-105">
                <h1 className="text-teal-600 text-4xl font-bold mb-4">✅ Appointment Confirmed!</h1>
                <p className="text-gray-600 mb-6">Your appointment has been successfully scheduled. Thank you for choosing our services!</p>

                <div className="bg-teal-50 p-4 rounded-lg shadow-inner mb-6">
                    <p className="text-teal-600 text-lg font-semibold">Transaction ID</p>
                    <p className="text-gray-500 text-sm">{txnid}</p>
                </div>

                <div className="text-left text-gray-700 mb-6">
                    <p className="mb-2"><span className="font-semibold">🩺 Doctor Appointment Confirmed</span></p>
                    <p className="mb-2"><span className="font-semibold">💵 Amount Paid:</span>₹ {amount}</p>
                    <p className="mb-2"><span className="font-semibold">🔢 Reference Number:</span> {bankRefNum}</p>
                </div>

                <button
                    onClick={handleOnclick}
                    className="bg-gradient-to-r from-teal-500 to-green-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg transform transition hover:scale-110 hover:shadow-xl focus:ring focus:ring-teal-300"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};

const PaymentSuccessPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentSuccessPageContent />
        </Suspense>
    );
};

export default PaymentSuccessPage;
