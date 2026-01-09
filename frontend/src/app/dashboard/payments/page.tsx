'use client';

import { CreditCard, Receipt, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function PaymentsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Payment History</h1>
                <p className="text-gray-500 mt-1 text-sm sm:text-base">View your transaction history and invoices.</p>
            </div>

            <div className="bg-white rounded-[2rem] border-2 border-dashed border-gray-100 p-8 sm:p-16 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-gray-100 shadow-sm">
                    <Receipt className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Payment History</h2>
                <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm sm:text-base">
                    You haven't made any payments yet. When you purchase event tickets, your invoices will appear here.
                </p>
                <Link href="/events">
                    <Button className="bg-[#004aad] hover:bg-[#003366] text-white border-0 rounded-xl px-6 py-2.5 font-bold shadow-lg shadow-blue-500/20">
                        Explore Paid Events <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
