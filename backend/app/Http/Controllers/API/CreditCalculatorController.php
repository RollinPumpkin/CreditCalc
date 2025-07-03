<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CreditCalculation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CreditCalculatorController extends Controller
{
    /**
     * Custom rounding function: 1-500 rounds to 500, 600-999 rounds to next 1000
     * Also removes decimals by converting to integer
     */
    private function customRound($amount)
    {
        // First convert to integer to remove decimals
        $amount = intval($amount);
        
        $lastThreeDigits = $amount % 1000;
        $baseAmount = $amount - $lastThreeDigits;
        
        if ($lastThreeDigits >= 1 && $lastThreeDigits <= 500) {
            return $baseAmount + 500;
        } elseif ($lastThreeDigits >= 501 && $lastThreeDigits <= 999) {
            return $baseAmount + 1000;
        } else {
            return $amount; // 0 or exact thousands remain unchanged
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $calculations = CreditCalculation::latest()->paginate(10);
        return response()->json($calculations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'loan_amount' => 'required|numeric|min:1',
            'interest_rate' => 'required|numeric|min:0|max:100',
            'loan_term_months' => 'required|integer|min:1|max:600',
            'customer_name' => 'nullable|string|max:255',
            'loan_type' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $loanAmount = $request->loan_amount;
        $interestRate = $request->interest_rate / 100; // Convert percentage to decimal
        $loanTermMonths = $request->loan_term_months;

        // Calculate monthly payment using custom formula: (Interest Rate x Loan Amount) + (Loan Amount / Loan Term)
        if ($interestRate > 0) {
            $monthlyRate = $interestRate;
            $interestPortion = $monthlyRate * $loanAmount;
            $principalPortion = $loanAmount / $loanTermMonths;
            $monthlyPayment = $interestPortion + $principalPortion;
        } else {
            // For 0% interest rate
            $monthlyPayment = $loanAmount / $loanTermMonths;
        }

        // Apply custom rounding
        $monthlyPayment = $this->customRound($monthlyPayment);

        $totalPayment = $monthlyPayment * $loanTermMonths;
        $totalInterest = $totalPayment - $loanAmount;

        $calculation = CreditCalculation::create([
            'loan_amount' => $loanAmount,
            'interest_rate' => $request->interest_rate,
            'loan_term_months' => $loanTermMonths,
            'monthly_payment' => round($monthlyPayment, 2),
            'total_payment' => round($totalPayment, 2),
            'total_interest' => round($totalInterest, 2),
            'customer_name' => $request->customer_name,
            'loan_type' => $request->loan_type ?? 'standard'
        ]);

        return response()->json([
            'success' => true,
            'data' => $calculation,
            'message' => 'Credit calculation completed successfully'
        ], 201);
    }

    /**
     * Calculate credit without storing (for real-time calculation)
     */
    public function calculate(Request $request)
    {
        Log::info('Calculate method called', ['request_data' => $request->all()]);
        
        $validator = Validator::make($request->all(), [
            'loan_amount' => 'required|numeric|min:1',
            'interest_rate' => 'required|numeric|min:0|max:100',
            'loan_term_months' => 'required|integer|min:1|max:600'
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422)->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }

        $loanAmount = $request->loan_amount;
        $interestRate = $request->interest_rate / 100;
        $loanTermMonths = $request->loan_term_months;

        if ($interestRate > 0) {
            $monthlyRate = $interestRate;
            $interestPortion = $monthlyRate * $loanAmount;
            $principalPortion = $loanAmount / $loanTermMonths;
            $monthlyPayment = $interestPortion + $principalPortion;
        } else {
            $monthlyPayment = $loanAmount / $loanTermMonths;
        }

        // Apply custom rounding
        $monthlyPayment = $this->customRound($monthlyPayment);

        $totalPayment = $monthlyPayment * $loanTermMonths;
        $totalInterest = $totalPayment - $loanAmount;

        // Generate payment schedule
        $paymentSchedule = [];
        $remainingBalance = $loanAmount;

        for ($month = 1; $month <= $loanTermMonths; $month++) {
            $interestPayment = $remainingBalance * ($interestRate / 12);
            $principalPayment = $monthlyPayment - $interestPayment;
            $remainingBalance -= $principalPayment;

            $paymentSchedule[] = [
                'month' => $month,
                'payment' => round($monthlyPayment, 2),
                'principal' => round($principalPayment, 2),
                'interest' => round($interestPayment, 2),
                'balance' => round(max(0, $remainingBalance), 2)
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'loan_amount' => $loanAmount,
                'interest_rate' => $request->interest_rate,
                'loan_term_months' => $loanTermMonths,
                'monthly_payment' => round($monthlyPayment, 2),
                'total_payment' => round($totalPayment, 2),
                'total_interest' => round($totalInterest, 2),
                'payment_schedule' => $paymentSchedule
            ]
        ])
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $calculation = CreditCalculation::find($id);
        
        if (!$calculation) {
            return response()->json([
                'success' => false,
                'message' => 'Calculation not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $calculation
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $calculation = CreditCalculation::find($id);
        
        if (!$calculation) {
            return response()->json([
                'success' => false,
                'message' => 'Calculation not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'customer_name' => 'nullable|string|max:255',
            'loan_type' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $calculation->update($request->only(['customer_name', 'loan_type']));

        return response()->json([
            'success' => true,
            'data' => $calculation,
            'message' => 'Calculation updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $calculation = CreditCalculation::find($id);
        
        if (!$calculation) {
            return response()->json([
                'success' => false,
                'message' => 'Calculation not found'
            ], 404);
        }

        $calculation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Calculation deleted successfully'
        ]);
    }
}
