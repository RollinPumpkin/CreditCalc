"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, Building2, AlertCircle } from "lucide-react";

interface CalculationResult {
  loan_amount: number;
  interest_rate: number;
  loan_term_months: number;
  monthly_payment: number;
  total_payment: number;
  total_interest: number;
  payment_schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export default function CreditCalculatorClient() {
  const [loanAmount, setLoanAmount] = useState("100000000");
  const [interestRate, setInterestRate] = useState("12.5");
  const [loanTermMonths, setLoanTermMonths] = useState("12");
  const [customerName, setCustomerName] = useState("");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("IDR");

  const calculateCredit = async () => {
    if (!loanAmount || !interestRate || !loanTermMonths) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/credit/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loan_amount: parseFloat(loanAmount),
          interest_rate: parseFloat(interestRate),
          loan_term_months: parseInt(loanTermMonths),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Calculation failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);
      if (data.success) {
        setResult(data.data);
        // toast.success('Perhitungan berhasil!', {
        //   description: 'Data kredit telah dihitung dengan lengkap.',
        // })
      } else {
        setError("Calculation failed");
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to calculate: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const saveCalculation = async () => {
    if (!result) return;

    setSaving(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/credit-calculations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loan_amount: result.loan_amount,
          interest_rate: result.interest_rate,
          loan_term_months: result.loan_term_months,
          customer_name: customerName,
        }),
      });

      if (response.ok) {
        alert("Perhitungan berhasil disimpan!");
      } else {
        alert("Gagal menyimpan perhitungan");
      }
    } catch (err) {
      alert("Gagal menyimpan perhitungan");
    } finally {
      setSaving(false);
    }
  };

  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat("id-ID").format(amount);
  };

  const getMonthYear = (monthIndex: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthIndex - 1);
    return date.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          
          {/* Left Panel - Input Form */}
          <Card className="shadow-2xl border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded">
                  <Calculator className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Credit Calculator</CardTitle>
                  <CardDescription className="text-red-100">
                    Kalkulator Kredit BPR Adiarta
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              {/* Loan Amount */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Jumlah Pinjaman
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={formatNumber(parseFloat(loanAmount) || 0)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, "");
                      setLoanAmount(value);
                    }}
                    className="text-right pr-16 h-12 text-lg font-semibold border-2 focus:border-red-500"
                    placeholder="100.000.000"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex">
                    <span className={`px-2 py-1 text-sm font-bold ${currency === "IDR" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-600"} rounded-l cursor-pointer`}
                          onClick={() => setCurrency("IDR")}>
                      IDR
                    </span>
                    <span className={`px-2 py-1 text-sm font-bold ${currency === "USD" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-600"} rounded-r cursor-pointer`}
                          onClick={() => setCurrency("USD")}>
                      USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Interest Rate Slider */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Suku Bunga Pertahun
                </Label>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1%</span>
                      <span>15%</span>
                      <span>30%</span>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="text-right pr-8 h-12 text-lg font-semibold border-2 focus:border-red-500"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">%</span>
                  </div>
                </div>
              </div>

              {/* Loan Term Slider */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Lama Pinjaman (Tahun)
                </Label>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="range"
                      min="6"
                      max="360"
                      step="6"
                      value={loanTermMonths}
                      onChange={(e) => setLoanTermMonths(e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>6 bln</span>
                      <span>10 thn</span>
                      <span>30 thn</span>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      value={Math.round(parseInt(loanTermMonths) / 12 * 10) / 10}
                      onChange={(e) => setLoanTermMonths(String(Math.round(parseFloat(e.target.value) * 12)))}
                      className="text-right pr-16 h-12 text-lg font-semibold border-2 focus:border-red-500"
                      step="0.5"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">Tahun</span>
                  </div>
                </div>
              </div>

              {/* Customer Name */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Nama Nasabah (Opsional)
                </Label>
                <Input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-12 text-lg border-2 focus:border-red-500"
                  placeholder="Masukkan nama nasabah"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={calculateCredit} 
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-lg shadow-lg"
              >
                {loading ? "Menghitung..." : "Hitung"}
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel - Results */}
          {result ? (
            <Card className="shadow-2xl border-0 bg-white">
              <CardContent className="p-0">
                {/* Summary Section */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-t-lg">
                  <div className="text-center">
                    <p className="text-sm text-blue-600 font-medium mb-2">ANGSURAN PER BULAN</p>
                    <h2 className="text-4xl font-bold text-blue-800 mb-4">
                      {formatNumber(result.monthly_payment)}
                    </h2>
                    
                    <div className="bg-blue-200 rounded-lg p-4 space-y-2">
                      <h3 className="font-bold text-blue-800 text-sm mb-3">TOTAL ANGSURAN PER BULAN</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Nominal (Rp)</span>
                          <span className="font-bold text-blue-800">{formatNumber(result.loan_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Jangka Waktu (Bulan)</span>
                          <span className="font-bold text-blue-800">{result.loan_term_months} Bulan</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Suku Bunga Pertahun</span>
                          <span className="font-bold text-blue-800">{result.interest_rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Tipe Bunga yang digunakan</span>
                          <span className="font-bold text-blue-800">Flat</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Schedule Table */}
                <div className="p-6">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-t-lg">
                    <div className="grid grid-cols-4 gap-4 text-sm font-bold text-center">
                      <div>Periode</div>
                      <div>Angsuran Bunga</div>
                      <div>Angsuran Pokok</div>
                      <div>Total Angsuran</div>
                    </div>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-b-lg">
                    {result.payment_schedule.slice(0, 5).map((payment, index) => (
                      <div key={payment.month} className={`grid grid-cols-4 gap-4 p-3 text-sm text-center ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                        <div className="font-medium">{getMonthYear(payment.month)}</div>
                        <div className="text-gray-700">{formatNumber(payment.interest)}</div>
                        <div className="text-gray-700">{formatNumber(payment.principal)}</div>
                        <div className="font-bold">{formatNumber(payment.payment)}</div>
                      </div>
                    ))}
                    
                    {/* Total Row */}
                    <div className="grid grid-cols-4 gap-4 p-3 text-sm text-center bg-orange-100 border-t-2 border-orange-300 font-bold">
                      <div className="text-orange-800">TOTAL</div>
                      <div className="text-orange-800">
                        {formatNumber(result.total_interest)}
                      </div>
                      <div className="text-orange-800">
                        {formatNumber(result.loan_amount)}
                      </div>
                      <div className="text-orange-800">
                        {formatNumber(result.total_payment)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={() => setResult(null)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                    >
                      Hitung Kembali
                    </Button>
                    <Button
                      onClick={saveCalculation}
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3"
                    >
                      {saving ? "Menyimpan..." : "Simpan Perhitungan"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Placeholder when no results */
            <Card className="shadow-2xl border-0 bg-white flex items-center justify-center">
              <CardContent className="text-center p-12">
                <Building2 className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">
                  Siap Menghitung
                </h3>
                <p className="text-gray-400">
                  Masukkan data pinjaman dan klik "Hitung" untuk melihat hasil
                  perhitungan
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
