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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calculator, Building2, AlertCircle, CalendarIcon } from "lucide-react";
import { format, differenceInMonths, addMonths } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [loanAmount, setLoanAmount] = useState("0");
  const [interestRate, setInterestRate] = useState("12.5");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addMonths(new Date(), 12));
  const [customerName, setCustomerName] = useState("");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("IDR");

  // Calculate loan term in months based on selected dates
  const getLoanTermMonths = () => {
    return Math.max(1, differenceInMonths(endDate, startDate));
  };

  const calculateCredit = async () => {
    if (!loanAmount || !interestRate || getLoanTermMonths() < 1) {
      setError("Please fill in all required fields and ensure valid date range");
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
          loan_term_months: getLoanTermMonths(),
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
          <Card className="shadow-2xl border-0 bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-700 to-red-800 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <Calculator className="h-6 w-6 text-red-700" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Credit Calculator</CardTitle>
                  <CardDescription className="text-red-100">
                    Kalkulator Kredit BPR Adiarta Reksacipta
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
                    className="text-left pr-16 h-12 text-lg font-semibold border-2 focus:border-red-600 focus:ring-2 focus:ring-red-100"
                    placeholder="e.g. 50.000.000"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex rounded-lg overflow-hidden border border-gray-300">
                    <span className={`px-3 py-2 text-sm font-bold transition-all cursor-pointer ${currency === "IDR" ? "bg-red-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                          onClick={() => setCurrency("IDR")}>
                      IDR
                    </span>
                    <span className={`px-3 py-2 text-sm font-bold transition-all cursor-pointer ${currency === "USD" ? "bg-red-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
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
                      className="w-full h-3 bg-gradient-to-r from-red-200 via-red-400 to-red-600 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #fecaca 0%, #f87171 50%, #dc2626 100%)`,
                      }}
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
                      className="text-right pr-8 h-12 text-lg font-semibold border-2 focus:border-red-600 focus:ring-2 focus:ring-red-100"
                      placeholder="e.g. 8.5"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">%</span>
                  </div>
                </div>
              </div>

              {/* Loan Term Date Picker */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Periode Pinjaman
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Tanggal Mulai</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 text-left font-normal border-2 hover:border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-100",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "dd/MM/yyyy") : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Tanggal Berakhir</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 text-left font-normal border-2 hover:border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-100",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "dd/MM/yyyy") : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => date && setEndDate(date)}
                          disabled={(date) => date <= startDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Display calculated loan term */}
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lama Pinjaman:</span>
                    <span className="text-lg font-semibold text-red-600">
                      {getLoanTermMonths()} Bulan ({(getLoanTermMonths() / 12).toFixed(1)} Tahun)
                    </span>
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
                  className="h-12 text-lg border-2 focus:border-red-600 focus:ring-2 focus:ring-red-100"
                  placeholder="e.g. Budi Santoso"
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
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Menghitung..." : "Hitung"}
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel - Results */}
          {result ? (
            <Card className="shadow-2xl border-0 bg-white overflow-hidden">
              <CardContent className="p-0">
                {/* Summary Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-8 border-b border-blue-200">
                  <div className="text-center">
                    <p className="text-sm text-blue-700 font-medium mb-2">ANGSURAN PER BULAN</p>
                    <h2 className="text-4xl font-bold text-blue-900 mb-4">
                      {formatNumber(result.monthly_payment)}
                    </h2>
                    
                    <div className="bg-blue-200 rounded-lg p-4 space-y-2 shadow-sm">
                      <h3 className="font-bold text-blue-900 text-sm mb-3">DETAIL ANGSURAN</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-800">Nominal (Rp)</span>
                          <span className="font-bold text-blue-900">{formatNumber(result.loan_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-800">Jangka Waktu (Bulan)</span>
                          <span className="font-bold text-blue-900">{result.loan_term_months} Bulan</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-800">Suku Bunga Pertahun</span>
                          <span className="font-bold text-blue-900">{result.interest_rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-800">Tipe Bunga yang digunakan</span>
                          <span className="font-bold text-blue-900">Flat</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Schedule Table */}
                <div className="p-6">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-t-lg shadow-sm">
                    <div className="grid grid-cols-4 gap-4 text-sm font-bold text-center">
                      <div>Periode</div>
                      <div>Angsuran Bunga</div>
                      <div>Angsuran Pokok</div>
                      <div>Total Angsuran</div>
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-b-lg">
                    {result.payment_schedule.map((payment, index) => (
                      <div key={payment.month} className={`grid grid-cols-4 gap-4 p-3 text-sm text-center ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                        <div className="font-medium">{getMonthYear(payment.month)}</div>
                        <div className="text-gray-700">{formatNumber(payment.interest)}</div>
                        <div className="text-gray-700">{formatNumber(payment.principal)}</div>
                        <div className="font-bold">{formatNumber(payment.payment)}</div>
                      </div>
                    ))}
                    
                    {/* Total Row */}
                    <div className="grid grid-cols-4 gap-4 p-4 text-sm text-center bg-red-50 border-t-2 border-red-300 font-bold">
                      <div className="text-red-800">TOTAL</div>
                      <div className="text-red-800">
                        {formatNumber(result.total_interest)}
                      </div>
                      <div className="text-red-800">
                        {formatNumber(result.loan_amount)}
                      </div>
                      <div className="text-red-800">
                        {formatNumber(result.total_payment)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={() => setResult(null)}
                      className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Hitung Kembali
                    </Button>
                    <Button
                      onClick={saveCalculation}
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
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
