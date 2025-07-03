<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('credit_calculations', function (Blueprint $table) {
            $table->id();
            $table->decimal('loan_amount', 15, 2);
            $table->decimal('interest_rate', 5, 2);
            $table->integer('loan_term_months');
            $table->decimal('monthly_payment', 15, 2);
            $table->decimal('total_payment', 15, 2);
            $table->decimal('total_interest', 15, 2);
            $table->string('customer_name')->nullable();
            $table->string('loan_type')->default('standard');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('credit_calculations');
    }
};
