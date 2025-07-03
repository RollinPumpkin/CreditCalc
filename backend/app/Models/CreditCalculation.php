<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreditCalculation extends Model
{
    protected $fillable = [
        'loan_amount',
        'interest_rate',
        'loan_term_months',
        'monthly_payment',
        'total_payment',
        'total_interest',
        'customer_name',
        'loan_type'
    ];

    protected $casts = [
        'loan_amount' => 'decimal:2',
        'interest_rate' => 'decimal:2',
        'monthly_payment' => 'decimal:2',
        'total_payment' => 'decimal:2',
        'total_interest' => 'decimal:2',
    ];
}
